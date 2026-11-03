import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { mainnet, polygon } from '@reown/appkit/networks';
const wallet=createAppKit({adapters:[new EthersAdapter()],networks:[mainnet,polygon],projectId:'120c9576f09c8e51fd55eec984c877e8',metadata:{name:'ORBS Community Portal',description:'Read-only ORBS staking and governance dashboard',url:'https://portal.orbs.kryp.xyz',icons:['https://www.orbs.com/marketing/brand-assets/orbs-logo-vertical.svg']},themeVariables:{'--w3m-font-family':'Montserrat, sans-serif'},features:{analytics:false,email:false,socials:false,swaps:false,onramp:false,send:false},themeMode:document.documentElement.dataset.theme==='dark'?'dark':'light'});
// Only an explicit Connect Wallet flow may request navigation; restored sessions do not.
let userConnectionPending=false;
wallet.subscribeAccount(account=>{const address=account.isConnected?account.address:null;const userInitiated=!!address&&userConnectionPending;if(address)userConnectionPending=false;window.dispatchEvent(new CustomEvent('portal-wallet-account',{detail:{address,userInitiated}}));},'eip155');
wallet.subscribeState(state=>{if(!state.open)userConnectionPending=false;});
window.portalWallet={open:async()=>{userConnectionPending=true;try{await wallet.open({view:'Connect'});}catch(error){userConnectionPending=false;throw error;}},disconnect:()=>{userConnectionPending=false;return wallet.disconnect('eip155');}};
new MutationObserver(()=>wallet.setThemeMode(document.documentElement.dataset.theme==='dark'?'dark':'light')).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
