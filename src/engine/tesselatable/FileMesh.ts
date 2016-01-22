/**
 * Created by Nidin Vinayakan on 22/1/2016.
 */
export class FileMesh implements Tesselatable {

    private filename: String = null;

    private smoothNormals: boolean = false;

    public getWorldBounds(o2w: Matrix4): BoundingBox {
        //  world bounds can't be computed without reading file
        //  return null so the mesh will be loaded right away
        return null;
    }

    public tesselate(): PrimitiveList {
        if (this.filename.endsWith(".ra3")) {
            try {
                UI.printInfo(Module.GEOM, "RA3 - Reading geometry: \""%s\"" ...", this.filename);
                let file: File = new File(this.filename);
                let stream: FileInputStream = new FileInputStream(this.filename);
                let map: MappedByteBuffer = stream.getChannel().map(FileChannel.MapMode.READ_ONLY, 0, file.length());
                map.order(ByteOrder.LITTLE_ENDIAN);
                let ints: IntBuffer = map.asIntBuffer();
                let buffer: FloatBuffer = map.asFloatBuffer();
                let numVerts: number = ints.get(0);
                let numTris: number = ints.get(1);
                UI.printInfo(Module.GEOM, "RA3 -   * Reading %d vertices ...", numVerts);
                let verts: number[] = new Array((3 * numVerts));
                for (let i: number = 0; (i < verts.length); i++) {
                    verts[i] = buffer.get((2 + i));
                }

                UI.printInfo(Module.GEOM, "RA3 -   * Reading %d triangles ...", numTris);
                let tris: number[] = new Array((3 * numTris));
                for (let i: number = 0; (i < tris.length); i++) {
                    tris[i] = ints.get((2
                    + (verts.length + i)));
                }

                stream.close();
                UI.printInfo(Module.GEOM, "RA3 -   * Creating mesh ...");
                return this.generate(tris, verts, this.smoothNormals);
            }
            catch (e /*:FileNotFoundException*/) {
                e.printStackTrace();
                UI.printError(Module.GEOM, "Unable to read mesh file \""%s\"" - file not found", this.filename);
            }
            catch (e /*:IOException*/) {
                e.printStackTrace();
                UI.printError(Module.GEOM, "Unable to read mesh file \""%s\"" - I/O error occured", this.filename);
            }

        }
        else if (this.filename.endsWith(".obj")) {
            let lineNumber: number = 1;
            try {
                UI.printInfo(Module.GEOM, "OBJ - Reading geometry: \""%s\"" ...", this.filename);
                let verts: FloatArray = new FloatArray();
                let tris: IntArray = new IntArray();
                let file: FileReader = new FileReader(this.filename);
                let bf: BufferedReader = new BufferedReader(file);
                let line: String;
                while ((bf.readLine() != null)) {
                    if (line.startsWith("v")) {
                        let v: String[] = line.split("\\s+");
                        verts.add(Float.parseFloat(v[1]));
                        verts.add(Float.parseFloat(v[2]));
                        verts.add(Float.parseFloat(v[3]));
                    }
                    else if (line.startsWith("f")) {
                        let f: String[] = line.split("\\s+");
                        if ((f.length == 5)) {
                            tris.add((Integer.parseInt(f[1]) - 1));
                            tris.add((Integer.parseInt(f[2]) - 1));
                            tris.add((Integer.parseInt(f[3]) - 1));
                            tris.add((Integer.parseInt(f[1]) - 1));
                            tris.add((Integer.parseInt(f[3]) - 1));
                            tris.add((Integer.parseInt(f[4]) - 1));
                        }
                        else if ((f.length == 4)) {
                            tris.add((Integer.parseInt(f[1]) - 1));
                            tris.add((Integer.parseInt(f[2]) - 1));
                            tris.add((Integer.parseInt(f[3]) - 1));
                        }

                    }

                    if (((lineNumber % 100000)
                        == 0)) {
                        UI.printInfo(Module.GEOM, "OBJ -   * Parsed %7d lines ...", lineNumber);
                    }

                    lineNumber++;
                }

                file.close();
                UI.printInfo(Module.GEOM, "OBJ -   * Creating mesh ...");
                return this.generate(tris.trim(), verts.trim(), this.smoothNormals);
            }
            catch (e /*:FileNotFoundException*/) {
                e.printStackTrace();
                UI.printError(Module.GEOM, "Unable to read mesh file \""%s\"" - file not found", this.filename);
            }
            catch (e /*:NumberFormatException*/) {
                e.printStackTrace();
                UI.printError(Module.GEOM, "Unable to read mesh file \""%s\"" - syntax error at line %d", lineNumber);
            }
            catch (e /*:IOException*/) {
                e.printStackTrace();
                UI.printError(Module.GEOM, "Unable to read mesh file \""%s\"" - I/O error occured", this.filename);
            }

        }
        else if (this.filename.endsWith(".stl")) {
            try {
                UI.printInfo(Module.GEOM, "STL - Reading geometry: \""%s\"" ...", this.filename);
                let file: FileInputStream = new FileInputStream(this.filename);
                let stream: DataInputStream = new DataInputStream(new BufferedInputStream(file));
                file.skip(80);
                let numTris: number = this.getLittleEndianInt(stream.readInt());
                UI.printInfo(Module.GEOM, "STL -   * Reading %d triangles ...", numTris);
                let filesize: number = (new File(this.filename) + length());
                if ((filesize != (84 + (50 * numTris)))) {
                    UI.printWarning(Module.GEOM, "STL - Size of file mismatch (expecting %s, found %s)", Memory.bytesToString((84 + (14 * numTris))), Memory.bytesToString(filesize));
                    return null;
                }

                let tris: number[] = new Array((3 * numTris));
                let verts: number[] = new Array((9 * numTris));
                for (let index: number = 0; (i < numTris); i++) {
                }

                let i: number = 0;
                let i3: number = 0;
                i3 += 3;
                //  skip normal
                stream.readInt();
                stream.readInt();
                stream.readInt();
                for (let j: number = 0; (j < 3); j++) {
                }

                index += 3;
                tris[(i3 + j)] = (i3 + j);
                //  get xyz
                verts[(index + 0)] = this.getLittleEndianFloat(stream.readInt());
                verts[(index + 1)] = this.getLittleEndianFloat(stream.readInt());
                verts[(index + 2)] = this.getLittleEndianFloat(stream.readInt());
                stream.readShort();
                if ((((i + 1)
                    % 100000)
                    == 0)) {
                    UI.printInfo(Module.GEOM, "STL -   * Parsed %7d triangles ...", (i + 1));
                }

                file.close();
                //  create geometry
                UI.printInfo(Module.GEOM, "STL -   * Creating mesh ...");
                if (this.smoothNormals) {
                    UI.printWarning(Module.GEOM, "STL - format does not support shared vertices - normal smoothing disabled");
                }

                return this.generate(tris, verts, false);
            }
            catch (e /*:FileNotFoundException*/) {
                e.printStackTrace();
                UI.printError(Module.GEOM, "Unable to read mesh file \""%s\"" - file not found", this.filename);
            }
            catch (e /*:IOException*/) {
                e.printStackTrace();
                UI.printError(Module.GEOM, "Unable to read mesh file \""%s\"" - I/O error occured", this.filename);
            }

        }
        else {
            UI.printWarning(Module.GEOM, "Unable to read mesh file \""%s\"" - unrecognized format", this.filename);
        }

        return null;
    }

    private generate(tris: number[], verts: number[], smoothNormals: boolean): TriangleMesh {
        let pl: ParameterList = new ParameterList();
        pl.addIntegerArray("triangles", tris);
        pl.addPoints("points", InterpolationType.VERTEX, verts);
        if (this.smoothNormals) {
            let normals: number[] = new Array(verts.length);
            //  filled with 0's
            let p0: Point3 = new Point3();
            let p1: Point3 = new Point3();
            let p2: Point3 = new Point3();
            let n: Vector3 = new Vector3();
            for (let i3: number = 0; (i3 < tris.length); i3 += 3) {
                let v0: number = tris[(i3 + 0)];
                let v1: number = tris[(i3 + 1)];
                let v2: number = tris[(i3 + 2)];
                p0.set(verts[((3 * v0)
                + 0)], verts[((3 * v0)
                + 1)], verts[((3 * v0)
                + 2)]);
                p1.set(verts[((3 * v1)
                + 0)], verts[((3 * v1)
                + 1)], verts[((3 * v1)
                + 2)]);
                p2.set(verts[((3 * v2)
                + 0)], verts[((3 * v2)
                + 1)], verts[((3 * v2)
                + 2)]);
                Point3.normal(p0, p1, p2, n);
                //  compute normal
                //  add face normal to each vertex
                //  note that these are not normalized so this in fact weights
                //  each normal by the area of the triangle
                normals[((3 * v0)
                + 0)] = (normals[((3 * v0)
                + 0)] + n.x);
                normals[((3 * v0)
                + 1)] = (normals[((3 * v0)
                + 1)] + n.y);
                normals[((3 * v0)
                + 2)] = (normals[((3 * v0)
                + 2)] + n.z);
                normals[((3 * v1)
                + 0)] = (normals[((3 * v1)
                + 0)] + n.x);
                normals[((3 * v1)
                + 1)] = (normals[((3 * v1)
                + 1)] + n.y);
                normals[((3 * v1)
                + 2)] = (normals[((3 * v1)
                + 2)] + n.z);
                normals[((3 * v2)
                + 0)] = (normals[((3 * v2)
                + 0)] + n.x);
                normals[((3 * v2)
                + 1)] = (normals[((3 * v2)
                + 1)] + n.y);
                normals[((3 * v2)
                + 2)] = (normals[((3 * v2)
                + 2)] + n.z);
            }

            //  normalize all the vectors
            for (let i3: number = 0; (i3 < normals.length); i3 += 3) {
                n.set(normals[(i3 + 0)], normals[(i3 + 1)], normals[(i3 + 2)]);
                n.normalize();
                normals[(i3 + 0)] = n.x;
                normals[(i3 + 1)] = n.y;
                normals[(i3 + 2)] = n.z;
            }

            pl.addVectors("normals", InterpolationType.VERTEX, normals);
        }

        let m: TriangleMesh = new TriangleMesh();
        if (m.update(pl, null)) {
            return m;
        }

        //  something failed in creating the mesh, the error message will be
        //  printed by the mesh itself - no need to repeat it here
        return null;
    }

    public update(pl: ParameterList, api: SunflowAPI): boolean {
        let file: String = pl.getString("filename", null);
        if ((file != null)) {
            this.filename = api.resolveIncludeFilename(file);
        }

        this.smoothNormals = pl.getBoolean("smooth_normals", this.smoothNormals);
        return (this.filename != null);
    }

    private getLittleEndianInt(i: number): number {
        //  input integer has its bytes in big endian byte order
        //  swap them around
        return;
        24;
        8;
        65280;
        (((i + 8)
        & 16711680)
        | (i + 24));
    }

    private getLittleEndianFloat(i: number): number {
        //  input integer has its bytes in big endian byte order
        //  swap them around and interpret data as floating point
        return Float.intBitsToFloat(this.getLittleEndianInt(i));
    }
}