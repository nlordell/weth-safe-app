import { getSafeInfo } from "./safesdk.js";
import { Ether, Weth } from "./tokens.js";

let safe;
let eth;
let weth;

let direction = "wrap";

function applyDirection() {
  if (direction === "wrap") {
    document.querySelector("#from").src = eth.logoUrl();
    document.querySelector("#to").src = weth.logoUrl();
    document.querySelector("#execute").textContent = "Wrap";
  } else {
    document.querySelector("#from").src = weth.logoUrl();
    document.querySelector("#to").src = eth.logoUrl();
    document.querySelector("#execute").textContent = "Unwrap";
  }
}

function onSwap() {
  direction = direction == "wrap" ? "unwrap" : "wrap";
  applyDirection();
}

async function onMax() {
  const token = direction === "wrap" ? eth : weth;
  const balance = await token.balanceOf(safe);
  document.querySelector("#amount").value = Ether.format(balance);
}

async function onExecute() {
  const amount = Ether.parse(document.querySelector("#amount").value);
  if (direction === "wrap") {
    await weth.deposit(amount);
  } else {
    await weth.withdraw(amount);
  }
}

function tri(f) {
  return async (...a) => {
    try {
      await f(...a);
    } catch (err) {
      alert(err.message);
    }
  };
}

async function main() {
  const { safeAddress, network } = await getSafeInfo();
  console.log(`using Safe ${safeAddress} on network ${network}`);

  safe = safeAddress;
  switch (network) {
    case "mainnet":
      eth = new Ether(1);
      weth = new Weth("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
      break;
  }

  console.log(await eth.balanceOf(safeAddress));
  console.log(await weth.balanceOf(safeAddress));

  applyDirection();
  document.querySelector("#swap").addEventListener("click", tri(onSwap));
  document.querySelector("#max").addEventListener("click", tri(onMax));
  document.querySelector("#execute").addEventListener("click", tri(onExecute));
}

main().catch(({ message }) => alert(`ERROR: ${message}`));
