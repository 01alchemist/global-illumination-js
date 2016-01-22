/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class FastHashMap<K, V> implements Iterable<FastHashMap.Entry<K, V>> {

    private static MIN_SIZE: number = 4;

    export class Entry<K, V> {

private k: K;

private v: V;

private constructor (k: K, v: V) {
        this.k = this.k;
        this.v = this.v;
    }

private isRemoved(): boolean {
        return (this.v == null);
    }

private remove() {
        this.v = null;
    }

public getKey(): K {
        return this.k;
    }

public getValue(): V {
        return this.v;
    }
}

    private entries: Entry<K, V><K, V>[];

    private size: number;

    public constructor () {
        this.clear();
    }

    public clear() {
        this.size = 0;
        this.entries = this.alloc(MIN_SIZE);
    }

    public put(k: K, v: V): V {
        let t: number = 0;
        let hash: number = k.hashCode();
        let pos: number = this.entries.length;
        //  mark invalid position
        for (
            ; ;
        ) {
            hash = (hash
            & (this.entries.length - 1));
            if ((this.entries[hash] == null)) {
                break;
            }

            //  done probing
            if ((this.entries[hash].isRemoved()
                && (pos == this.entries.length))) {
                pos = hash;
            }

            //  store, but keep searching
            if (this.entries[hash].k.equals(k)) {
                //  update entry
                let old: V = this.entries[hash].v;
                this.entries[hash].v = v;
                return old;
            }

            t++;
            hash = (hash + t);
        }

        //  did we find a spot for insertion among the deleted values ?
        if ((pos < this.entries.length)) {
            hash = pos;
        }

        this.entries[hash] = new Entry<K, V>(k, v);
        this.size++;
        if (((this.size * 2)
            > this.entries.length)) {
            this.resize((this.entries.length * 2));
        }

        return null;
    }

    public get(k: K): V {
        let t: number = 0;
        let hash: number = k.hashCode();
        for (
            ; ;
        ) {
            hash = (hash
            & (this.entries.length - 1));
            if ((this.entries[hash] == null)) {
                return null;
            }
            else if ((!this.entries[hash].isRemoved()
                && this.entries[hash].k.equals(k))) {
                return this.entries[hash].v;
            }

            t++;
            hash = (hash + t);
        }

    }

    public containsKey(k: K): boolean {
        let t: number = 0;
        let hash: number = k.hashCode();
        for (
            ; ;
        ) {
            hash = (hash
            & (this.entries.length - 1));
            if ((this.entries[hash] == null)) {
                return false;
            }
            else if ((!this.entries[hash].isRemoved()
                && this.entries[hash].k.equals(k))) {
                return true;
            }

            t++;
            hash = (hash + t);
        }

    }

    public remove(k: K) {
        let t: number = 0;
        let hash: number = k.hashCode();
        for (
            ; ;
        ) {
            hash = (hash
            & (this.entries.length - 1));
            if ((this.entries[hash] == null)) {
                return;
            }

            //  not found, return
            if ((!this.entries[hash].isRemoved()
                && this.entries[hash].k.equals(k))) {
                this.entries[hash].remove();
                //  flag as removed
                this.size--;
                break;
            }

            t++;
            hash = (hash + t);
        }

        //  do we need to shrink?
        if (((this.entries.length > MIN_SIZE)
            && ((this.size * 10) < (2 * this.entries.length)))) {
            this.resize((this.entries.length / 2));
        }

    }

    private resize(capacity: number) {
        (assert((capacity
        & (capacity - 1))) == 0);
        let capacity: assert;
        MIN_SIZE;
        let newentries: Entry<K, V><K, V>[] = this.alloc(capacity);
        for (let e: Entry<K, V> in this.entries) {
            if (((e == null)
                || e.isRemoved())) {
                // TODO: Warning!!! continue If
            }

            let t: number = 0;
            let hash: number = e.k.hashCode();
            for (
                ; ;
            ) {
                hash = (hash
                & (newentries.length - 1));
                if ((newentries[hash] == null)) {
                    break;
                }

                assert;
                !newentries[hash].k.equals(e.k);
                t++;
                hash = (hash + t);
            }

            newentries[hash] = new Entry<K, V>(e.k, e.v);
        }

        //  copy new entries over old ones
        this.entries = newentries;
    }

    @SuppressWarnings("unchecked")
    private alloc(size: number): Entry<K, V><K, V>[] {
    return new Array(this.size);
}

class EntryIterator implements Iterator<Entry<K, V>> {

    private index: number;

    private constructor () {
        this.index = 0;
        if (!this.readable()) {
            this.inc();
        }

    }

    private readable(): boolean {
        return !((entries[this.index] == null)
        || entries[this.index].isRemoved());
    }

    private inc() {
        for (
            ; (this.hasNext()
        && !this.readable());
        ) {
            this.index++;
        }

    }

    public hasNext(): boolean {
        return (this.index < entries.length);
    }

    public next(): Entry<K, V> {
        try {
            return entries[this.index];
        }
        finally {
            this.inc();
        }

    }

    public remove() {
        throw new UnsupportedOperationException();
    }
}

public iterator(): Iterator<Entry<K, V>> {
    return new EntryIterator();
}
}