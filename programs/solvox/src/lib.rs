use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("GQqUyuyVnf9vHG3hzHztPt53nZyRSjnrmjLSmEabRNjc");

const SECONDS_PER_DAY: i64 = 86_400;

#[program]
pub mod solvox {
    use super::*;

    /// Initializes a user's PolicyVault PDA with daily spend limit, minimum trust grade, and delegate agent.
    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        daily_spend_limit: u64,
        min_trust_grade: u8,
        delegate_agent: Pubkey,
    ) -> Result<()> {
        require!(
            (1..=5).contains(&min_trust_grade),
            SolVoxError::InvalidGrade
        );

        let vault = &mut ctx.accounts.vault;
        vault.owner = ctx.accounts.owner.key();
        vault.delegate_agent = delegate_agent;
        vault.daily_spend_limit = daily_spend_limit;
        vault.spent_today = 0;
        vault.last_reset_ts = Clock::get()?.unix_timestamp;
        vault.min_trust_grade = min_trust_grade;
        vault.paused = false;
        vault.bump = ctx.bumps.vault;

        Ok(())
    }

    /// Deposits native devnet SOL from owner into the PolicyVault PDA.
    pub fn deposit_vault(ctx: Context<DepositVault>, amount: u64) -> Result<()> {
        require!(amount > 0, SolVoxError::InvalidAmount);

        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.owner.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        );
        system_program::transfer(cpi_ctx, amount)?;

        Ok(())
    }

    /// Updates policy limits or pauses/unpauses the PolicyVault (owner only).
    pub fn update_policy(
        ctx: Context<UpdatePolicy>,
        daily_spend_limit: u64,
        min_trust_grade: u8,
        paused: bool,
    ) -> Result<()> {
        require!(
            (1..=5).contains(&min_trust_grade),
            SolVoxError::InvalidGrade
        );

        let vault = &mut ctx.accounts.vault;
        vault.daily_spend_limit = daily_spend_limit;
        vault.min_trust_grade = min_trust_grade;
        vault.paused = paused;

        Ok(())
    }

    /// Attestor writes or updates a target wallet's A-F trust grade (5=A .. 1=F) in TrustEntry PDA.
    pub fn set_trust_grade(
        ctx: Context<SetTrustGrade>,
        grade: u8,
        report_hash: [u8; 32],
    ) -> Result<()> {
        require!((1..=5).contains(&grade), SolVoxError::InvalidGrade);

        let entry = &mut ctx.accounts.trust_entry;
        entry.target = ctx.accounts.target.key();
        entry.attestor = ctx.accounts.attestor.key();
        entry.grade = grade;
        entry.report_hash = report_hash;
        entry.updated_at = Clock::get()?.unix_timestamp;
        entry.bump = ctx.bumps.trust_entry;

        Ok(())
    }

    /// Executes a policy- and trust-guarded native SOL transfer from the vault PDA to target.
    /// The caller NEVER passes the grade; it is read directly from TrustEntry PDA on-chain.
    pub fn execute_guarded_action(
        ctx: Context<ExecuteGuardedAction>,
        amount: u64,
        nonce: u64,
    ) -> Result<()> {
        require!(amount > 0, SolVoxError::InvalidAmount);

        let now = Clock::get()?.unix_timestamp;
        let vault = &mut ctx.accounts.vault;

        require!(!vault.paused, SolVoxError::VaultPaused);

        // Reset daily counter if 24h have elapsed
        if now - vault.last_reset_ts >= SECONDS_PER_DAY {
            vault.spent_today = 0;
            vault.last_reset_ts = now;
        }

        // 1. Enforce on-chain TrustRegistry grade
        let trust_entry = &ctx.accounts.trust_entry;
        require!(
            trust_entry.grade >= vault.min_trust_grade,
            SolVoxError::InsufficientTrustGrade
        );

        // 2. Enforce daily spend limit
        let new_spent = vault
            .spent_today
            .checked_add(amount)
            .ok_or(SolVoxError::DailyLimitExceeded)?;
        require!(
            new_spent <= vault.daily_spend_limit,
            SolVoxError::DailyLimitExceeded
        );

        // 3. Ensure vault retains rent-exempt minimum lamports
        let vault_info = vault.to_account_info();
        let rent_min = Rent::get()?.minimum_balance(vault_info.data_len());
        let available = vault_info
            .lamports()
            .checked_sub(rent_min)
            .ok_or(SolVoxError::InsufficientVaultBalance)?;
        require!(available >= amount, SolVoxError::InsufficientVaultBalance);

        // Update spent_today before transferring lamports
        vault.spent_today = new_spent;
        let vault_key = vault.key();
        let grade_at_exec = trust_entry.grade;

        // Transfer lamports from PolicyVault PDA to target
        **vault_info.try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.target.to_account_info().try_borrow_mut_lamports()? += amount;

        // Write immutable ActionReceipt PDA
        let receipt = &mut ctx.accounts.receipt;
        receipt.vault = vault_key;
        receipt.target = ctx.accounts.target.key();
        receipt.amount = amount;
        receipt.grade_at_execution = grade_at_exec;
        receipt.timestamp = now;
        receipt.nonce = nonce;
        receipt.bump = ctx.bumps.receipt;

        Ok(())
    }

    /// Withdraws native SOL from PolicyVault PDA back to owner.
    pub fn withdraw_vault(ctx: Context<WithdrawVault>, amount: u64) -> Result<()> {
        require!(amount > 0, SolVoxError::InvalidAmount);

        let vault_info = ctx.accounts.vault.to_account_info();
        let rent_min = Rent::get()?.minimum_balance(vault_info.data_len());
        let available = vault_info
            .lamports()
            .checked_sub(rent_min)
            .ok_or(SolVoxError::InsufficientVaultBalance)?;
        require!(available >= amount, SolVoxError::InsufficientVaultBalance);

        **vault_info.try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.owner.to_account_info().try_borrow_mut_lamports()? += amount;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + PolicyVault::INIT_SPACE,
        seeds = [b"vault", owner.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, PolicyVault>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositVault<'info> {
    #[account(
        mut,
        seeds = [b"vault", owner.key().as_ref()],
        bump = vault.bump,
        has_one = owner
    )]
    pub vault: Account<'info, PolicyVault>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePolicy<'info> {
    #[account(
        mut,
        seeds = [b"vault", owner.key().as_ref()],
        bump = vault.bump,
        has_one = owner
    )]
    pub vault: Account<'info, PolicyVault>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetTrustGrade<'info> {
    #[account(
        init_if_needed,
        payer = attestor,
        space = 8 + TrustEntry::INIT_SPACE,
        seeds = [b"trust", target.key().as_ref()],
        bump
    )]
    pub trust_entry: Account<'info, TrustEntry>,
    /// CHECK: Target wallet whose trust grade is being attested.
    pub target: UncheckedAccount<'info>,
    #[account(mut)]
    pub attestor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64, nonce: u64)]
pub struct ExecuteGuardedAction<'info> {
    #[account(
        mut,
        seeds = [b"vault", owner.key().as_ref()],
        bump = vault.bump,
        has_one = owner
    )]
    pub vault: Account<'info, PolicyVault>,
    #[account(
        seeds = [b"trust", target.key().as_ref()],
        bump = trust_entry.bump
    )]
    pub trust_entry: Account<'info, TrustEntry>,
    #[account(
        init,
        payer = payer,
        space = 8 + ActionReceipt::INIT_SPACE,
        seeds = [b"receipt", vault.key().as_ref(), &nonce.to_le_bytes()],
        bump
    )]
    pub receipt: Account<'info, ActionReceipt>,
    /// CHECK: Vault owner (validated via has_one = owner on vault).
    pub owner: UncheckedAccount<'info>,
    /// CHECK: Recipient wallet verified against TrustEntry PDA.
    #[account(mut)]
    pub target: UncheckedAccount<'info>,
    /// Signer paying for ActionReceipt rent (owner or delegate_agent).
    #[account(
        mut,
        constraint = payer.key() == vault.owner || payer.key() == vault.delegate_agent @ SolVoxError::UnauthorizedCaller
    )]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawVault<'info> {
    #[account(
        mut,
        seeds = [b"vault", owner.key().as_ref()],
        bump = vault.bump,
        has_one = owner
    )]
    pub vault: Account<'info, PolicyVault>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct PolicyVault {
    pub owner: Pubkey,
    pub delegate_agent: Pubkey,
    pub daily_spend_limit: u64,
    pub spent_today: u64,
    pub last_reset_ts: i64,
    pub min_trust_grade: u8,
    pub paused: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct TrustEntry {
    pub target: Pubkey,
    pub attestor: Pubkey,
    pub grade: u8,
    pub report_hash: [u8; 32],
    pub updated_at: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct ActionReceipt {
    pub vault: Pubkey,
    pub target: Pubkey,
    pub amount: u64,
    pub grade_at_execution: u8,
    pub timestamp: i64,
    pub nonce: u64,
    pub bump: u8,
}

#[error_code]
pub enum SolVoxError {
    #[msg("Trust grade must be between 1 (F) and 5 (A).")]
    InvalidGrade,
    #[msg("Amount must be greater than zero.")]
    InvalidAmount,
    #[msg("PolicyVault is currently paused.")]
    VaultPaused,
    #[msg("Caller is not authorized to execute on this vault.")]
    UnauthorizedCaller,
    #[msg("Target wallet trust grade is below PolicyVault minimum.")]
    InsufficientTrustGrade,
    #[msg("Transfer exceeds PolicyVault daily spend limit.")]
    DailyLimitExceeded,
    #[msg("Insufficient SOL balance in PolicyVault.")]
    InsufficientVaultBalance,
}
