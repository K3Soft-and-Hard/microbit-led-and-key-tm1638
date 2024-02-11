/**
* makecode LED & KEY (TM1638)
* based on https://github.com/azplanlos/TM1638/tree/main
* and https://github.com/iardsoft/circuitpython-tm1638/tree/main

*/

/**
 * Four Digit Display
 */
//% weight=100 color=#50A820 icon="8"
namespace K3TM1638 {

    const TM1638_CMD1 = 0x40    // data command
    const TM1638_CMD2 = 0xC0    // address command
    const TM1638_CMD3 = 0x80    // display control command
    const TM1638_DSP_ON = 0x08  // display on
    const TM1638_READ = 0x02    // read key scan data
    const TM1638_FIXED = 0x04   // fixed address mode

    export enum Color {
        RED = 0,
        GREEN = 1
    }

    const fontMap = [
        0x00, /* (space) */
        0x86, /* ! */
        0x22, /* " */
        0x7E, /* # */
        0x6D, /* $ */
        0xD2, /* % */
        0x46, /* & */
        0x20, /* ' */
        0x29, /* ( */
        0x0B, /* ) */
        0x21, /* * */
        0x70, /* + */
        0x10, /* , */
        0x40, /* - */
        0x80, /* . */
        0x52, /* / */
        0x3F, /* 0 */
        0x06, /* 1 */
        0x5B, /* 2 */
        0x4F, /* 3 */
        0x66, /* 4 */
        0x6D, /* 5 */
        0x7D, /* 6 */
        0x07, /* 7 */
        0x7F, /* 8 */
        0x6F, /* 9 */
        0x09, /* : */
        0x0D, /* ; */
        0x61, /* < */
        0x48, /* = */
        0x43, /* > */
        0xD3, /* ? */
        0x5F, /* @ */
        0x77, /* A */
        0x7C, /* B */
        0x39, /* C */
        0x5E, /* D */
        0x79, /* E */
        0x71, /* F */
        0x3D, /* G */
        0x76, /* H */
        0x30, /* I */
        0x1E, /* J */
        0x75, /* K */
        0x38, /* L */
        0x15, /* M */
        0x37, /* N */
        0x3F, /* O */
        0x73, /* P */
        0x6B, /* Q */
        0x33, /* R */
        0x6D, /* S */
        0x78, /* T */
        0x3E, /* U */
        0x3E, /* V */
        0x2A, /* W */
        0x76, /* X */
        0x6E, /* Y */
        0x5B, /* Z */
        0x39, /* [ */
        0x64, /* \ */
        0x0F, /* ] */
        0x23, /* ^ */
        0x08, /* _ */
        0x02, /* ` */
        0x5F, /* a */
        0x7C, /* b */
        0x58, /* c */
        0x5E, /* d */
        0x7B, /* e */
        0x71, /* f */
        0x6F, /* g */
        0x74, /* h */
        0x10, /* i */
        0x0C, /* j */
        0x75, /* k */
        0x30, /* l */
        0x14, /* m */
        0x54, /* n */
        0x5C, /* o */
        0x73, /* p */
        0x67, /* q */
        0x50, /* r */
        0x6D, /* s */
        0x78, /* t */
        0x1C, /* u */
        0x1C, /* v */
        0x14, /* w */
        0x76, /* x */
        0x6E, /* y */
        0x5B, /* z */
    ]

    /**
     * TM1638 LED display
     */
    export class TM1638LEDs {
        clk: DigitalPin;
        dio: DigitalPin;
        strobe: DigitalPin;
        brightness: number;
        count: number;  // number of LEDs

        /**
         * initial TM1638
         */
        setup(): void {
            pins.digitalWritePin(this.clk, 1);
            pins.digitalWritePin(this.dio, 0);
            pins.digitalWritePin(this.strobe, 1);
            this.sendCommand(143);
            this.setBrightness(this.brightness);
            this.clear();
            /*
            //this.sendCommand(143);
            this.clear();
            this._write_data_cmd()
            //this.setBrightness(this.brightness);
            */
        }

        startCommand(): void {
            pins.digitalWritePin(this.strobe, 0);
        }

        endCommand(): void {
            pins.digitalWritePin(this.strobe, 1);
        }

        sendCommand(num: number): void {
            this.startCommand();
            this.writeByte(num);
            this.endCommand();
        }

        // data command: automatic address increment, normal mode
        _write_data_cmd(): void {
            this.sendCommand(TM1638_CMD1)
        }

        // display command: display on, set brightness
        _write_dsp_ctrl(): void {
            this.sendCommand(TM1638_CMD3 | TM1638_DSP_ON | this.brightness);
        }

        // address command: move to address
        _set_address(addr: number = 0) {
            this.sendCommand(TM1638_CMD2 | addr)
        }


        writeByte(num: number): void {
            for (let j = 0; j < 8; j++) {
                pins.digitalWritePin(this.clk, 0);
                pins.digitalWritePin(this.dio, (num >> j) & 1);
                pins.digitalWritePin(this.clk, 1);
            }
        }

        /**
         * set TM1638 intensity, range is [0-7], 0 is off.
         * @param brightness the brightness of the TM1638, eg: 7
         */
        //% blockId="TM1638_set_intensity" block="%tm|set intensity %brightness"
        //% block.loc.de="%tm|setze Helligkeit %brightness"
        //% weight=50 blockGap=8
        //% parts="TM1638"
        setBrightness(brightness: number = 7): void {
            this.brightness = 0x07 & brightness;
            this._write_dsp_ctrl()
        }

        /**
         * show a number.
         * @param num is a number, eg: 0
         */
        //% blockId="TM1638_shownum" block="%tm|show number %num"
        //% block.loc.de="%tm|zeige Zahl %num"
        //% weight=91 blockGap=8
        //% parts="TM1638"
        showNumber(num: number): void {
            let strg = "" + num;
            let vals = strg.split('');
            let offset = 8 - vals.length;
            for (let i = offset; i < 8; i++) {
                this.show7Segment(i, fontMap[16 + parseInt(vals[i - offset])]);
            }
        }

        /**
         * shows text output on 7 segment displa<y
         * @param text text output to display
         */
        //% blockId="TM1638_showText" block="%tm|display text %text"
        //% block.loc.de="%tm|gebe Text aus %text"
        //% weight=70 blockGap=8
        //% parts="TM1638"
        showText(text: string): void {
            let vals = text.toUpperCase().split('')
            for (let i = 0; i < Math.min(vals.length, 8); i++) {
                this.show7Segment(i, fontMap[vals[i].charCodeAt(0) - 32]);
            }
        }

        /**
         * show font based output on 7 segment display
         * @param position display number
         * @param value byte value to show
         */
        //% blockId="TM1638_show7seg" block="%tm|show 7 segment at %position|show %value"
        //% block.loc.de="%tm|Ausgabe auf 7-Segment %position|Wert %value"
        //% weight=70 blockGap=8
        //% parts="TM1638"
        show7Segment(position: number, value: number): void {
            this.sendCommand(0x44);
            this.startCommand();
            this.writeByte(0xC0 + (position << 1));
            this.writeByte(value);
            this.endCommand();
        }

        /**
         * turn LED on or off
         * @param ledNum LED number
         * @param on on/off
         * @param col color of led
         */
        //% blockId="TM1638_setLed" block="%tm|turn LED %ledNum|on/off %on|color %col"
        //% block.loc.de="%tm|schalte LED %ledNum|ein/aus %on|Farbe %col"
        //% weight=70 blockGap=8
        //% parts="TM1638"
        //% ledNum.min=1 ledNum.max=8 ledNum.defl=1
        //% col.def=Color.RED
        setLed(ledNum: number, on: boolean, col: Color = Color.RED): void {
            let letAdr = ((ledNum - 1) << 1);
            this.sendCommand(68);
            this.startCommand();
            this.writeByte(193 + letAdr);
            this.writeByte(on ? (col === Color.GREEN ? 1 : 2) : 0);
            this.endCommand();
        }

        /**
         * clear LED.
         */
        //% blockId="TM1638_clear" block="clear %tm"
        //% block.loc.de="lösche Ausgabe %tm"
        //% weight=80 blockGap=8
        //% parts="TM1638"
        clear(): void {
            this._write_data_cmd()
            this.startCommand();
            for (let index = 0; index < 16; index++) {
                this.writeByte(0x00);
            }
            this.endCommand();
        }

        readByte(): number {
            let num = 0;
            for (let k = 0; k <= 7; k++) {
                pins.digitalWritePin(this.clk, 1);
                num |= pins.digitalReadPin(this.dio) << k;
                pins.digitalWritePin(this.clk, 0);
            }
            return num;
        }

        // Reads one of the four bytes representing which keys are pressed.
        _scan_keys(): number {
            let pressed = 0
            //pins.setPull(this.dio, PinPullMode.PullUp)
            for (let k = 0; k <= 7; k++) {
                pins.digitalWritePin(this.clk, 0);
                let b = pins.digitalReadPin(this.dio);
                if (b != 0) {
                    pressed |= 1 << k
                }
                pins.digitalWritePin(this.clk, 1);
            }
            return pressed
        }


        /**
         * reads button states as binary number, Button 1 equals 1, Button 2 equals 2, Button 8 equals 128, etc.
         * Multiple pressed buttons can be detected.
         */
        //% blockId="TM1638_readButtons" block="%tm read button states"
        //% block.loc.de="%tm Taster status"
        //% weight=80 blockGap=8
        //% parts="TM1638"
        readButtons(): number {
            // Return a byte representing which keys are pressed.LSB is SW1
            let keys = 0
            this.startCommand()
            this.writeByte(TM1638_CMD1 | TM1638_READ)
            for (let i = 0; i < 4; i++) {
                keys |= this._scan_keys() << i
            }
            this.endCommand();
            return keys

        /*            
            this.startCommand();
            this.writeByte(0x42);
            basic.pause(1);
            let buttons = 0;
            let buttons2 = 0;
            let buttons3 = 0;
            let v = 0;
            let v2 = 0;
            let v3 = 0;
            for (let i = 0; i < 4; i++) {
                let byte = this.readByte();
                v = (byte & 0b00100010) << i;
                v2 = (byte & 0b01000100) << i;
                v3 = (byte & 0b10001000) << i;
                buttons |= v;
                buttons2 |= v2;
                buttons3 |= v3;
            }
            this.endCommand();
            return buttons + (buttons2 * 255) + (buttons3 * 255 * 255);
            */
        }

        /**
         * check if button is pressed
         * @param buttonNum button number to check. Starts with 1
         */
        //% blockId="TM1638_buttonState" block="%tm button %buttonNum|pressed"
        //% block.loc.de="%tm Taster %buttonNum|gedrückt"
        //% weight=80 blockGap=8
        //% parts="TM1638"
        //% buttonNum.min=1 buttonNum.max=24 buttonNum.defl=1
        buttonPressed(buttonNum: number): boolean {
            return (this.readButtons() >> (buttonNum - 1) & 1) == 1
        }
    }

    /**
     * create a TM1638 object.
     * @param clk the CLK pin for TM1638, eg: DigitalPin.P1
     * @param dio the DIO pin for TM1638, eg: DigitalPin.P2
     * @param strobe the Strobe pin for TM1638, eg. DigitalPin.P0
     * @param intensity the brightness of the LED, eg: 7
     * @param count the count of the LED, eg: 8
     */
    //% weight=200 blockGap=8
    //% blockId="TM1638_create" block="CLK %clk|DIO %dio|strobe %strobe|intensity %intensity|LED count %count"
    //% block.loc.de="CLK %clk|DIO %dio|StrobePin %strobe|Intensität %intensity|LED Anzahl %count"
    export function create(clk: DigitalPin, dio: DigitalPin, strobe: DigitalPin, intensity: number, count: number): TM1638LEDs {
        let tm = new TM1638LEDs();
        tm.clk = clk;
        tm.dio = dio;
        tm.strobe = strobe;
        if ((count < 1) || (count > 9)) count = 8;
        tm.count = count;
        tm.brightness = intensity;
        tm.setup();
        return tm;
    }
}