// ----- Types
import { ProviderExternalVerificationError, type Provider, type ProviderOptions } from "../../types";
import type { RequestPayload, VerifiedPayload } from "@gitcoin/passport-types";

// ----- Credential verification
import { getRPCProvider } from "../../utils/signer";

// Export a Ens Provider to carry out Ens name check and return a record object
export class EnsProvider implements Provider {
  // Give the provider a type so that we can select it with a payload
  type = "Ens";
  // Options can be set here and/or via the constructor
  _options = {};

  // construct the provider instance with supplied options
  constructor(options: ProviderOptions = {}) {
    this._options = { ...this._options, ...options };
  }

  // Verify that the address defined in the payload has an ENS reverse lookup registered
  async verify(payload: RequestPayload): Promise<VerifiedPayload> {
    const errors = [];
    let valid = false,
      reportedName: string,
      record = undefined;

    try {
      const provider = getRPCProvider(payload);
      reportedName = await provider.lookupAddress(payload.address);
      valid = !!reportedName;
      if (valid) {
        record = {
          ens: reportedName,
        };
      } else {
        errors.push("Primary ENS name was not found for given address.");
      }

      if (!valid && errors.length === 0) {
        errors.push("We were unable to determine the cause of your error");
      }

      return {
        valid,
        errors,
        record,
      };
    } catch (e: unknown) {
      throw new ProviderExternalVerificationError(`Error verifying ENS name: ${String(e)}`);
    }
  }
}
