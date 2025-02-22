import NfcManager,  { Ndef, NfcTech } from "react-native-nfc-manager";
import { NdefTagInfo } from "../types/NdefTypes";

/**
 * Class which provides methods for reading and writing ndef tags
 */
export default class NdefTools {
  /**
   * Method for cancelling the current listener
   */
  cancelRequest: () => void;
  constructor () {
    this.cancelRequest = () => NfcManager.cancelTechnologyRequest();
  }

  /**
   * Function which listens until a Ndef tag is detected in the device's NFC reader. Then returns the id of the
   * Ndef tag and its decoded payload (as "content")
   * 
   * @return {Promise<NdefTagInfo | undefined>} An object containing the id and the decoded payload of the NFC tag or undefined in case there was an error reading the tag (The error will be logged).
   */
  async readTag (): Promise<NdefTagInfo | undefined> {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();

      if (tag && tag.id) {
        return {
          id: tag.id,
          content: Ndef.uri.decodePayload(tag.ndefMessage[0].payload as unknown as Uint8Array)
            .replace('https://www.en', ''),
        }
      } else {
        throw new Error('Reading the tag was not possible.')
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.cancelRequest();
    }
  }


  /**
   * Function that writes a value as the payload of a Ndef tag and returns a boolean wether the card was written
   * successfully
   * 
   * @param value The value that will be written to the Ndef card
   * 
   * @returns A boolean wether the card was written successfully or not
   */
  async writeTag (value: string): Promise<boolean> {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      
      const bytes = Ndef.encodeMessage([Ndef.textRecord(value)]);

      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Writing the card was not possible.');
      return false;
    } finally {
      this.cancelRequest();
    }
  }
}