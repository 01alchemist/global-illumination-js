/**
 * Created by Nidin Vinayakan on 21/1/2016.
 */
export class FastDisplay extends JPanel implements Display {

    private frame:JFrame;

    private image:BufferedImage;

    private pixels:number[];

    private t:Timer;

    private seconds:number;

    private frames:number;

    constructor () {
        this.image = null;
        this.frame = null;
        this.t = new Timer();
        this.frames = 0;
        this.seconds = 0;
    }

    imageBegin(w:number, h:number, bucketSize:number) {
        if (((this.frame != null)
            && ((this.image != null)
            && ((w == this.image.getWidth())
            && (h == this.image.getHeight()))))) {
            //  nothing to do
        }
        else {
            //  allocate new framebuffer
            this.pixels = new Array((w * h));
            this.image = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
            //  prepare frame
            if ((this.frame == null)) {
                setPreferredSize(new Dimension(w, h));
                this.frame = new JFrame(("Sunflow v" + GlobalIlluminationAPI.VERSION));
                this.frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
                this.frame.addKeyListener(new KeyAdapter());
                this.frame.setContentPane(this);
                this.frame.pack();
                this.frame.setLocationRelativeTo(null);
                this.frame.setVisible(true);
            }

        }

        //  start counter
        this.t.start();
    }

    imagePrepare(x:number, y:number, w:number, h:number, id:number) {

    }

    imageUpdate(x:number, y:number, w:number, h:number, data:Color[]) {
        let iw:number = this.image.getWidth();
        let off:number = (x
        + (iw * y));
        iw = (iw - w);
        for (let index:number = 0; (j < h); j++) {
        }

        let j:number = 0;
        off = (off + iw);
        for (let i:number = 0; (i < w); i++) {
        }

        index++;
        off++;
        this.pixels[off] = (4278190080 | data[index].toRGB());
    }

    imageFill(x:number, y:number, w:number, h:number, c:Color) {
        let iw:number = this.image.getWidth();
        let off:number = (x
        + (iw * y));
        iw = (iw - w);
        let rgb:number = (4278190080 | c.toRGB());
        for (let index:number = 0; (j < h); j++) {
        }

        let j:number = 0;
        off = (off + iw);
        for (let i:number = 0; (i < w); i++) {
        }

        index++;
        off++;
        this.pixels[off] = rgb;
    }

    imageEnd() {
        //  copy buffer
        this.image.setRGB(0, 0, this.image.getWidth(), this.image.getHeight(), this.pixels, 0, this.image.getWidth());
        repaint();
        //  update stats
        this.t.end();
        this.seconds = (this.seconds + this.t.seconds());
        this.frames++;
        if ((this.seconds > 1)) {
            //  display average fps every second
            this.frame.setTitle(String.format("Sunflow v%s - %.2f fps", GlobalIlluminationAPI.VERSION, (this.frames / this.seconds)));
            this.frames = 0;
            this.seconds = 0;
        }

    }

    paint(g:Graphics) {
        if ((this.image == null)) {
            return;
        }

        g.drawImage(this.image, 0, 0, null);
    }
}