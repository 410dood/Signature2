import { ChangeEvent, createElement, PureComponent, ReactNode } from "react";

// @ts-expect-error signature_pad has no types
import SignaturePad, { IOptions } from "signature_pad";
import classNames from "classnames";
import ReactResizeDetector from "react-resize-detector";

import { Alert } from "./Alert";
import { Grid } from "./Grid";
import { Dimensions, SizeContainer } from "./SizeContainer";

import "../ui/Signature.scss";

export interface SignatureProps extends Dimensions {
    className: string;
    alertMessage?: string;
    clearSignature: boolean;
    showGrid: boolean;
    gridCellWidth: number;
    gridCellHeight: number;
    gridBorderColor: string;
    gridBorderWidth: number;
    penType: penOptions;
    penColor: string;
    onSignEndAction?: (imageUrl?: string) => void;
    wrapperStyle?: object;
    readOnly: boolean;
    signatureMode: "draw" | "type";
    showModeToggle: boolean;
    showClearButton: boolean;
    showSaveButton: boolean;
    saveButtonCaption?: string;
    saveButtonCaptionDefault?: string;
    onSave?: (imageUrl?: string) => void;
    isSaveEnabled?: boolean;
    showHeader: boolean;
    headerText?: string;
    showWatermark: boolean;
    watermarkText?: string;
    onWatermarkChange?: (value: string) => void;
    isWatermarkReadOnly?: boolean;
    typeFontFamily: string;
    typeFontSize: number;
    typePlaceholder: string;
}

export type penOptions = "fountain" | "ballpoint" | "marker";

interface SignatureState {
    mode: "draw" | "type";
    typedText: string;
    hasSignature: boolean;
}

export class Signature extends PureComponent<SignatureProps, SignatureState> {
    private canvasNode: HTMLCanvasElement | null = null;
    // @ts-expect-error signature_pad has no types
    private signaturePad: SignaturePad;

    constructor(props: SignatureProps) {
        super(props);
        this.state = {
            mode: props.signatureMode,
            typedText: "",
            hasSignature: false
        };
    }

    render(): ReactNode {
        const { className, alertMessage, wrapperStyle } = this.props;

        return (
            <SizeContainer
                {...this.props}
                className={classNames("widget-signature", className)}
                classNameInner="widget-signature-wrapper form-control mx-textarea-input mx-textarea"
                style={wrapperStyle}
            >
                <Alert bootstrapStyle="danger">{alertMessage}</Alert>
                {this.renderHeader()}
                {this.renderControls()}
                <div className="widget-signature-canvas-area">
                    <Grid {...this.props} />
                    <canvas
                        className="widget-signature-canvas"
                        ref={(node: HTMLCanvasElement | null): void => {
                            this.canvasNode = node;
                        }}
                    />
                    {this.renderWatermark()}
                </div>
                <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} />
            </SizeContainer>
        );
    }

    private renderHeader(): ReactNode {
        if (!this.props.showHeader || !this.props.headerText) {
            return null;
        }
        return <div className="widget-signature-header">{this.props.headerText}</div>;
    }

    private renderControls(): ReactNode {
        if (this.props.readOnly) {
            return null;
        }

        const showToggle = this.props.showModeToggle;
        const showInput = this.state.mode === "type";
        const showClear = this.props.showClearButton;
        const showSave = this.props.showSaveButton;

        if (!showToggle && !showInput && !showClear && !showSave) {
            return null;
        }

        return (
            <div className="widget-signature-controls">
                {showToggle ? (
                    <div className="widget-signature-toggle">
                        <button
                            type="button"
                            className={this.state.mode === "draw" ? "active" : ""}
                            onClick={() => this.setMode("draw")}
                        >
                            Draw
                        </button>
                        <button
                            type="button"
                            className={this.state.mode === "type" ? "active" : ""}
                            onClick={() => this.setMode("type")}
                        >
                            Type
                        </button>
                    </div>
                ) : null}
                {showInput ? (
                    <input
                        className="widget-signature-typed-input"
                        type="text"
                        placeholder={this.props.typePlaceholder}
                        value={this.state.typedText}
                        onChange={this.onTypedChange}
                    />
                ) : null}
                {showClear ? (
                    <button type="button" className="widget-signature-clear" onClick={this.handleClearClick}>
                        Clear
                    </button>
                ) : null}
                {showSave ? (
                    <button
                        type="button"
                        className="widget-signature-save"
                        onClick={this.handleSaveClick}
                        disabled={!this.props.isSaveEnabled}
                    >
                        {this.props.saveButtonCaption || this.props.saveButtonCaptionDefault || "Save"}
                    </button>
                ) : null}
            </div>
        );
    }

    componentDidMount(): void {
        if (this.canvasNode) {
            this.signaturePad = new SignaturePad(this.canvasNode, {
                penColor: this.props.penColor,
                onEnd: this.handleSignEnd,
                ...this.signaturePadOptions()
            });
            this.applyMode();
        }
    }

    componentDidUpdate(prevProps: SignatureProps): void {
        if (this.signaturePad) {
            if (prevProps.clearSignature !== this.props.clearSignature && this.props.clearSignature) {
                this.clearCanvas();
                this.setState({ typedText: "", hasSignature: false });
            }
            if (prevProps.readOnly !== this.props.readOnly) {
                this.applyMode();
            }
            if (prevProps.penColor !== this.props.penColor) {
                this.signaturePad.penColor = this.props.penColor;
                if (this.state.mode === "type" && this.state.typedText) {
                    this.renderTypedSignature(this.state.typedText);
                }
            }
            if (prevProps.signatureMode !== this.props.signatureMode) {
                this.setMode(this.props.signatureMode);
            }
            if (
                prevProps.typeFontFamily !== this.props.typeFontFamily ||
                prevProps.typeFontSize !== this.props.typeFontSize
            ) {
                if (this.state.mode === "type" && this.state.typedText) {
                    this.renderTypedSignature(this.state.typedText);
                }
            }
        }
    }

    private onResize = (): void => {
        if (this.canvasNode) {
            this.canvasNode.width =
                this.canvasNode && this.canvasNode.parentElement ? this.canvasNode.parentElement.offsetWidth : 0;
            this.canvasNode.height =
                this.canvasNode && this.canvasNode.parentElement ? this.canvasNode.parentElement.offsetHeight : 0;
            if (this.state.mode === "type") {
                this.renderTypedSignature(this.state.typedText);
            } else {
                const data = this.signaturePad.toData();
                this.signaturePad.clear();
                this.signaturePad.fromData(data);
            }
        }
    };

    private signaturePadOptions(): IOptions {
        let options: IOptions = {};
        if (this.props.penType === "fountain") {
            options = { minWidth: 0.6, maxWidth: 2.6, velocityFilterWeight: 0.6 };
        } else if (this.props.penType === "ballpoint") {
            options = { minWidth: 1.4, maxWidth: 1.5, velocityFilterWeight: 1.5 };
        } else if (this.props.penType === "marker") {
            options = { minWidth: 2, maxWidth: 4, velocityFilterWeight: 0.9 };
        }
        return options;
    }

    private handleSignEnd = (): void => {
        if (this.props.onSignEndAction && this.state.mode === "draw") {
            this.props.onSignEndAction(this.signaturePad.toDataURL());
        }
        if (this.signaturePad && !this.signaturePad.isEmpty()) {
            this.setState({ hasSignature: true });
        }
    };

    private setMode(mode: "draw" | "type"): void {
        if (mode === this.state.mode) {
            return;
        }
        this.setState({ mode }, () => this.applyMode());
    }

    private applyMode(): void {
        if (!this.signaturePad) {
            return;
        }
        if (this.props.readOnly) {
            this.signaturePad.off();
            return;
        }
        if (this.state.mode === "type") {
            this.clearCanvas();
            this.signaturePad.off();
            this.renderTypedSignature(this.state.typedText);
        } else {
            this.clearCanvas();
            this.signaturePad.on();
        }
    }

    private onTypedChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const text = event.target.value;
        this.setState({ typedText: text, hasSignature: text.trim().length > 0 }, () => {
            this.renderTypedSignature(text);
            if (this.props.onSignEndAction && text.trim()) {
                this.props.onSignEndAction(this.signaturePad.toDataURL());
            }
        });
    };

    private renderTypedSignature(text: string): void {
        if (!this.canvasNode) {
            return;
        }
        const ctx = this.canvasNode.getContext("2d");
        if (!ctx) {
            return;
        }

        this.clearCanvas();

        if (!text.trim()) {
            return;
        }

        const maxWidth = this.canvasNode.width * 0.9;
        let fontSize = Math.max(this.props.typeFontSize, 8);
        ctx.font = `${fontSize}px ${this.props.typeFontFamily}`;

        while (ctx.measureText(text).width > maxWidth && fontSize > 8) {
            fontSize -= 2;
            ctx.font = `${fontSize}px ${this.props.typeFontFamily}`;
        }

        ctx.fillStyle = this.props.penColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, this.canvasNode.width / 2, this.canvasNode.height / 2);
    }

    private handleClearClick = (): void => {
        this.clearCanvas();
        if (this.state.typedText) {
            this.setState({ typedText: "", hasSignature: false });
        } else if (this.state.hasSignature) {
            this.setState({ hasSignature: false });
        }
    };

    private handleSaveClick = (): void => {
        if (!this.props.onSave) {
            return;
        }
        const dataUrl = this.canvasNode ? this.canvasNode.toDataURL("image/png") : undefined;
        this.props.onSave(dataUrl);
    };

    private renderWatermark(): ReactNode {
        if (!this.props.showWatermark || !this.state.hasSignature) {
            return null;
        }
        if (this.props.onWatermarkChange) {
            return (
                <input
                    className="widget-signature-watermark-input"
                    type="text"
                    value={this.props.watermarkText ?? ""}
                    onChange={this.onWatermarkChange}
                    disabled={this.props.isWatermarkReadOnly}
                />
            );
        }
        return <div className="widget-signature-watermark-text">{this.props.watermarkText}</div>;
    }

    private onWatermarkChange = (event: ChangeEvent<HTMLInputElement>): void => {
        if (this.props.onWatermarkChange) {
            this.props.onWatermarkChange(event.target.value);
        }
    };

    private clearCanvas(): void {
        if (!this.canvasNode) {
            return;
        }
        const ctx = this.canvasNode.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, this.canvasNode.width, this.canvasNode.height);
        }
        if (this.signaturePad) {
            this.signaturePad.clear();
        }
    }
}
