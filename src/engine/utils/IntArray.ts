/**
 * Created by Nidin Vinayakan on 29/1/2016.
 */
export class IntArray {

    private array:Int32Array;
    private size:int;


    public constructor(capacity:int = 10) {
        this.array = new Int32Array(capacity);
        this.size = 0;
    }

    /**
     * Append an integer to the end of the array.
     *
     * @param i
     */
    public add(i:int) {
        if (this.size == this.array.length) {
            var oldArray:Int32Array = this.array;
            this.array = new Int32Array((this.size * 3) / 2 + 1);
            this.array.set(oldArray);
        }
        this.array[this.size] = i;
        this.size++;
    }

    /**
     * Write a value to the specified index. Assumes the array is already big
     * enough.
     *
     * @param index
     * @param value
     */
    public set(index:int, value:int) {
        this.array[index] = value;
    }

    /**
     * Read value from the array.
     *
     * @param index index into the array
     * @return value at the specified index
     */
    @final
    public get(index:int) {
        return this.array[index];
    }

    /**
     * Returns the number of elements added to the array.
     *
     * @return current size of the array
     */
    @final
    public getSize() {
        return this.size;
    }

    /**
     * Return a copy of the array, trimmed to fit the size of its contents
     * exactly.
     *
     * @return a new array of exactly the right length
     */
    @final
    public trim():Int32Array {
        if (this.size < this.array.length) {
            var oldArray = this.array;
            this.array = new Int32Array(size);
            this.array.set(oldArray);
        }
        return array;
    }
}