/**
 * It will extract the numbers from a multiline string and return the sum of all numbers
 * @param value Multiline string with numbers
 * @param cb Callback with sum of numbers
 */
export const calculateTotal = (value: string, cb?: (value: string) => void) => {
    const numbers = value.match(/\d+/g) || []; // extract all numbers
    const sum = numbers.reduce((acc, num) => acc + parseInt(num), 0);
    if (cb) {
        cb(String(sum))
    } else {
        return String(sum)
    }
}