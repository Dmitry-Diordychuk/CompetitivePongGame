
// https://www.cryptosys.net/pki/uuid-rfc4122.html
export default function uuidv4() {
    let buffer = new ArrayBuffer(16);
    let int8View = new Int8Array(buffer);

    crypto.getRandomValues(int8View);
    int8View[6] = 0x40 | (int8View[6] & 0xf);
    int8View[8] = 0x80 | (int8View[8] & 0x3f);

    let hexArray = Array.from(int8View, (byte) => {
        return ("0" + (byte & 0xff).toString(16)).slice(-2);
    });

    let result1 = hexArray[0] + hexArray[1] + hexArray[2] + hexArray[3];

    let result2 = hexArray[4] + hexArray[5];

    let result3 = hexArray[6] + hexArray[7];

    let result4 = hexArray[8] + hexArray[9];

    let result5 = hexArray[10] + hexArray[11] + hexArray[12] + hexArray[13] + hexArray[14] + hexArray[15];

    return result1 + "-" + result2 + "-" + result3 + "-" + result4 +'-'+ result5
}