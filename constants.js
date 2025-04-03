// Initial loading messages for the flash process
const initialLoadingMessages = [
  "Initializing system protocols, please wait…",
  "Establishing secure connection, loading configurations…",
  "Preparing environment, verifying essential components…",
  "System check in progress, optimizing performance…",
  "Loading core modules, ensuring smooth operation…",
  "Verifying security layers, establishing encryption protocols…",
  "Synchronizing data streams, initializing flash process…",
  "Optimizing memory allocation, boosting software stability…",
  "Checking system integrity, validating core dependencies…",
  "Activating essential scripts, configuring user settings…",
  "Performing diagnostics, ensuring smooth initialization…",
  "Securing transaction pathways, preparing digital environment…",
  "Connecting to network, optimizing latency response…",
  "Preloading essential assets, finalizing system boot…",
  "Running final checks, initialization almost complete…"
];

// License verification messages
const licenseVerificationMessages = [
  "Verifying license key, please wait…",
  "Authenticating license, checking database records…",
  "Validating license integrity, ensuring compliance…",
  "Cross-referencing license server, confirming legitimacy…",
  "Decoding license signature, verifying encryption…",
  "License key accepted, establishing secure session…",
  "Confirming activation status, checking validity period…",
  "Synchronizing with license server, updating credentials…",
  "Securing access rights, finalizing authentication…",
  "License verification complete…"
];

// BIP key verification messages
const bipVerificationMessages = [
  "Verifying BIP key, please wait…",
  "Authenticating BIP key, checking security layers…",
  "Validating key format, ensuring compliance…",
  "Cross-checking key against encryption standards…",
  "Decoding BIP key, extracting secure credentials…",
  "Ensuring BIP key legitimacy, scanning blockchain…",
  "Checking cryptographic integrity, validating signature…",
  "Running security protocols, confirming key authenticity…",
  "Key verification successful, securing access…",
  "Secure connection established, proceeding with validation…",
  "Initializing transaction setup, preparing execution…",
  "Securing transaction pathway, optimizing security…",
  "Encrypting transaction details, verifying authenticity…",
  "Synchronizing blockchain nodes, establishing handshake…",
  "Checking network latency, ensuring smooth execution…",
  "Allocating liquidity, confirming available resources…",
  "Fetching market data, adjusting transaction parameters…",
  "Optimizing blockchain relay, securing connections…",
  "Cross-referencing ledger, confirming blockchain state…",
  "Preparing smart contract deployment, validating code…",
  "Running system diagnostics, ensuring optimal conditions…",
  "Conducting real-time risk assessment, minimizing exposure…",
  "Performing cryptographic hashing, securing data…",
  "Validating transaction parameters, confirming execution rights…",
  "Configuring digital wallet protocols, establishing link…",
  "Encrypting transaction metadata, securing blockchain entry…",
  "Checking node synchronization, ensuring consistency…",
  "Generating digital signature, securing transaction request…",
  "Confirming secure tunnel, preventing unauthorized access…",
  "Preparing blockchain ledger update, securing integrity…",
  "Executing transaction pre-checks, verifying conditions…",
  "Loading flash execution sequence, optimizing speed…",
  "Generating unique transaction hash, securing records…",
  "Ensuring transaction non-reversibility, locking execution…",
  "Securing blockchain relay, finalizing encryption…",
  "Initiating asset flash, confirming digital footprint…",
  "Updating real-time transaction ledger, ensuring accuracy…",
  "Finalizing smart contract execution, securing payout…",
  "Confirming transaction state, locking blockchain entry…",
  "Completing cryptographic proof, ensuring finality…",
  "Performing last verification sweep, finalizing process…",
  "Confirming digital asset transfer, logging event…",
  "Blockchain relay complete, verifying final record…",
  "Secure transaction initiated, awaiting blockchain confirmation…",
  "Transaction completed, updating network ledger…",
  "Flash execution successful, confirming final state…",
  "Locking transaction details, ensuring future verification…",
  "Data integrity confirmed, finalizing ledger entry…",
  "Secure transaction closed, logging final confirmation…",
  "Flash process fully executed…"
];

// Payment status messages
const paymentStatusMessages = [
  "Verifying payment, please wait…",
  "Authenticating transaction, checking blockchain records…",
  "Validating payment details, ensuring compliance…",
  "Cross-referencing transaction ID, confirming legitimacy…",
  "Decoding payment signature, verifying encryption…",
  "Payment verification in progress, establishing secure session…",
  "Confirming transaction status, checking blockchain…",
  "Synchronizing with payment server, updating records…",
  "Securing transaction details, finalizing verification…",
  "Payment verification complete, processing transaction…"
];

// Dropdown data
const walletOptions = [
  'MetaMask',
  'Trust Wallet',
  'Coinbase Wallet',
  'Binance Wallet',
  'Ledger',
  'Trezor',
  'Exodus',
  'Atomic Wallet',
  'Electrum',
  'Mycelium',
  'Guarda',
  'Jaxx Liberty',
  'eToro Wallet',
  'Blockchain.com',
  'Argent',
  'ZenGo',
  'Crypto.com DeFi Wallet',
  'Huobi Wallet',
  'OKX Wallet',
  'Kraken Wallet'
];

const currencyOptions = [
  'USD (US Dollar)',
  'EUR (Euro)',
  'GBP (British Pound)',
  'JPY (Japanese Yen)',
  'CNY (Chinese Yuan)'
];

const networkOptions = [
  'TRC20 (Tron)',
  'ERC20 (Ethereum)',
  'BEP20 (Binance Smart Chain)',
  'SOL (Solana)',
  'MATIC (Polygon)'
];

const dayOptions = ['0', '1', '2', '3', '5', '7', '14', '30'];
const minuteOptions = ['0', '15', '30', '45', '60', '120', '240'];

// Export all constants
module.exports = {
  initialLoadingMessages,
  licenseVerificationMessages,
  bipVerificationMessages,
  paymentStatusMessages,
  walletOptions,
  currencyOptions,
  networkOptions,
  dayOptions,
  minuteOptions
};
