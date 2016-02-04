import {BufferedImage} from "../image/BufferedImage";
import {Dimension} from "../math/Dimension";
import {Color} from "../math/Color";
import {GlobalIlluminationAPI} from "../GlobalIlluminatiionAPI";
/**
 * Created by Nidin Vinayakan on 21/1/2016.
 */
export class FastDisplay extends JPanel implements Display {

    private frame:JFrame;
    private image:BufferedImage;
    private pixels:Int32Array;
    private t:number;
    private seconds:number;
    private frames:number;

    constructor () {
        this.image = null;
        this.frame = null;
        this.frames = 0;
        this.seconds = 0;
    }

    imageBegin(w:int, h:int, bucketSize:int) {
        if (this.frame != null && this.image != null && w == this.image.getWidth() && h == this.image.getHeight()) {
            //  nothing to do
        }
        else {
            //  allocate new framebuffer
            this.pixels = new Int32Array(w * h);
            this.image = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
            //  prepare frame
            if (this.frame == null) {
                this.setPreferredSize(new Dimension(w, h));
                this.frame = new JFrame(("GIJS v" + GlobalIlluminationAPI.VERSION));
                this.frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
                this.frame.addKeyListener(new KeyAdapter());
                this.frame.setContentPane(this);
                this.frame.pack();
                this.frame.setLocationRelativeTo(null);
                this.frame.setVisible(true);
            }

        }

        //  start counter
        this.t = performance.now();
    }

    imagePrepare(x:number, y:number, w:number, h:number, id:number) {

    }

    imageUpdate(x:number, y:number, w:number, h:number, data:Color[]) {
        var iw:int = image.getWidth();
        var off:int = x + iw * y;
        iw -= w;
        for (var j:int = 0, index = 0; j < h; j++, off += iw) {
            for (var i:int = 0; i < w; i++, index++, off++) {
                pixels[off] = 0xFF000000 | data[index].toRGB();
            }
        }
    }

    imageFill(x:number, y:number, w:number, h:number, c:Color) {
        var iw:int = image.getWidth();
        var off:int = x + iw * y;
        iw -= w;
        var rgb:int = 0xFF000000 | c.toRGB();
        for (var j:int = 0, index = 0; j < h; j++, off += iw) {
            for (var i:int = 0; i < w; i++, index++, off++) {
                pixels[off] = rgb;
            }
        }
    }

    imageEnd() {
        //  copy buffer
        this.image.setRGB(0, 0, this.image.getWidth(), this.image.getHeight(), this.pixels, 0, this.image.getWidth());
        this.repaint();
        //  update stats
        this.t = performance.now() - t;
        this.seconds = this.seconds + (this.t / 1000);
        this.frames++;
        if ((this.seconds > 1)) {
            //  display average fps every second
            this.frame.setTitle(String.format("GIJS v"+GlobalIlluminationAPI.VERSION+" - "+(this.frames / this.seconds).toFixed(2)+" fps"));
            this.frames = 0;
            this.seconds = 0;
        }

    }

    paint(g:CanvasRenderingContext2D) {
        if ((this.image == null)) {
            return;
        }

        g.drawImage(this.image, 0, 0, null);
    }
}