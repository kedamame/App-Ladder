import { Attribution } from "ox/erc8021";
import { concatHex, type Hex } from "viem";

type AttributionInput = {
  appCode?: string;
  walletCode?: string;
  source?: string;
};

export function appendBuilderAttribution(
  calldata: Hex,
  options: AttributionInput = {},
): Hex {
  const suffix = Attribution.toDataSuffix({
    appCode: options.appCode ?? "baseapp",
    walletCode: options.walletCode,
    metadata: {
      source: options.source ?? "app-ladder",
    },
  });

  return concatHex([calldata, suffix]);
}
