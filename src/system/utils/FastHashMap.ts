/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class Entry<K, V> {

    constructor (private k:K, private v:V) {}

    private isRemoved():boolean {
        return (this.v == null);
    }

    private remove() {
        this.v = null;
    }

    getKey():K {
        return this.k;
    }

    getValue():V {
        return this.v;
    }
}
export class FastHashMap<K, V> implements Iterable<Entry<K, V>> {

    private static MIN_SIZE:number = 4;
    private entries:Entry<K, V>[];
    private size:number;

    constructor () {
        this.clear();
    }

    clear() {
        this.size = 0;
        this.entries = this.alloc(MIN_SIZE);
    }

    put(k:K, v:V):V {
        let t:number = 0;
        let hash:number = k.hashCode();
        let pos:number = this.entries.length;
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
                let old:V = this.entries[hash].v;
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

    get(k:K):V {
        let t:number = 0;
        let hash:number = k.hashCode();
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

    containsKey(k:K):boolean {
        let t:number = 0;
        let hash:number = k.hashCode();
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

    remove(k:K) {
        let t:number = 0;
        let hash:number = k.hashCode();
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

    private resize(capacity:number) {
        assert((capacity & (capacity - 1)) == 0);
        assert(capacity >= FastHashMap.MIN_SIZE);

        let newEntries:Entry<K, V>[] = this.alloc(capacity);
        this.entries.forEech(function(e:Entry<K, V>){
            if (e == null || e.isRemoved()) {
                return;
            }

            let t:number = 0;
            let hash:number = e.k.hashCode();
            for (; ;) {
                hash &= newEntries.length - 1;
                if (newEntries[hash] == null) {
                    break;
                }

                assert(!newEntries[hash].k.equals(e.k));
                t++;
                hash += t;
            }

            newEntries[hash] = new Entry<K, V>(e.k, e.v);
        });

        //  copy new entries over old ones
        this.entries = newEntries;
    }

    @SuppressWarnings("unchecked")
    private alloc(size:number):Entry<K, V>[] {
        return new Entry(this.size);
    }

    iterator():Iterator<Entry<K, V>> {
        return new EntryIterator();
    }
}
class EntryIterator implements Iterator<Entry<K, V>> {

    private index:number;

    private constructor () {
        this.index = 0;
        if (!this.readable()) {
            this.inc();
        }

    }

    private readable():boolean {
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

    hasNext():boolean {
        return (this.index < entries.length);
    }

    next():Entry<K, V> {
        try {
            return entries[this.index];
        }
        finally {
            this.inc();
        }

    }

    remove() {
        throw "UnsupportedOperationException";
    }
}