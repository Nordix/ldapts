import { Ber, BerReader } from 'asn1';

import type { Control } from './controls';
import { EntryChangeNotificationControl, PagedResultsControl, PersistentSearchControl, ServerSideSortingRequestControl } from './controls';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ControlParser {
  /**
   * Parse control from reader
   * @param {BerReader} reader
   * @param {Control[]} [controls] - Controls specified for specific message
   */
  public static parse(reader: BerReader, controls?: Control[]): Control | null {
    if (reader.readSequence() === null) {
      return null;
    }

    let type = '';
    let critical = false;
    let value: Buffer = Buffer.alloc(0);
    if (reader.length) {
      const end = reader.offset + reader.length;

      type = reader.readString();
      if (reader.offset < end) {
        if (reader.peek() === Ber.Boolean) {
          critical = reader.readBoolean();
        }
      }

      if (reader.offset < end) {
        value = reader.readString(Ber.OctetString, true);
      }
    }

    let control: Control | undefined;

    switch (type) {
      case EntryChangeNotificationControl.type:
        control = new EntryChangeNotificationControl({
          critical,
        });
        break;
      case PagedResultsControl.type:
        control = new PagedResultsControl({
          critical,
        });
        break;
      case PersistentSearchControl.type:
        control = new PersistentSearchControl({
          critical,
        });
        break;
      case ServerSideSortingRequestControl.type:
        control = new ServerSideSortingRequestControl({
          critical,
        });
        break;
      default:
        control = controls?.find((messageControls) => messageControls.type === type);
        break;
    }

    if (control) {
      const controlReader = new BerReader(value);
      control.parse(controlReader);
      return control;
    }

    return null;
  }
}
