import { rpcCall, sendTransactions } from "./safesdk.js";

const UNIT = 10n ** 18n;
const MAX_U256 = (1n << 256n) - 1n;

const sig = {
  balanceOf: "70a08231",
  deposit: "d0e30db0",
  withdraw: "2e1a7d4d",
};

const abi = {
  addr: (a) => {
    if (!/^0x[0-9a-fA-F]{40}$/.test(a)) {
      throw new Error(`invalid address ${a}`);
    }
    return a.replace(/^0x/, "").toLowerCase().padStart(64, "0");
  },
  uint: (x) => {
    if (x > MAX_U256) {
      throw new Error(`invalid amount ${x}`);
    }
    return x.toString(16).padStart(64, "0");
  },
};

export class Weth {
  constructor(address) {
    this.address = address;
  }

  logoUrl() {
    return `https://gnosis-safe-token-logos.s3.amazonaws.com/${this.address}.png`;
  }

  async deposit(amount) {
    await sendTransactions([{
      to: this.address,
      value: `0x${amount.toString(16)}`,
      data: `0x${sig.deposit}`,
    }]);
  }

  async withdraw(amount) {
    await sendTransactions([{
      to: this.address,
      value: "0x0",
      data: `0x${sig.withdraw}${abi.uint(amount)}`,
    }]);
  }

  async balanceOf(account, block = "latest") {
    return BigInt(
      await rpcCall("eth_call", [{
        to: this.address,
        data: `0x${sig.balanceOf}${abi.addr(account)}`,
      }, block]),
    );
  }
}

export class Ether {
  constructor(chainId) {
    this.chainId = chainId;
  }

  logoUrl() {
    return `https://safe-transaction-assets.gnosis-safe.io/chains/${this.chainId}/currency_logo.png`;
  }

  async balanceOf(account, block = "latest") {
    return BigInt(
      await rpcCall("eth_getBalance", [account, block]),
    );
  }

  static parse(value) {
    const [eth, wei, extra] = value.toString().split(".");
    if (extra !== undefined || (wei ?? "").length > 18) {
      throw new Error(`invalid amount ${value}`);
    }

    let amount;
    try {
      amount = BigInt(eth.padStart(1, "0")) * UNIT +
        BigInt(wei.padEnd(18, "0"));
    } catch {
      throw new Error(`invalid amount ${value}`);
    }

    if (amount > MAX_U256) {
      throw new Error(`invalid amount ${value}`);
    }
    return amount;
  }

  static format(value) {
    if (value > MAX_U256) {
      throw new Error(`invalid amount ${value}`);
    }

    return value.toString()
      .padStart(19, "0")
      .replace(/(.{18})$/, ".$1")
      .replace(/\.?0*$/, "");
  }
}
