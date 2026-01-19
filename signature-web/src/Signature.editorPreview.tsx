import { createElement, ReactElement } from "react";

import { SignaturePreviewProps } from "../typings/SignatureProps";
import { Signature as SignatureCanvas } from "./components/Signature";

declare function require(name: string): string;

export function preview(props: SignaturePreviewProps): ReactElement {
    return (
        <SignatureCanvas
            className={props.class}
            wrapperStyle={props.styleObject}
            width={props.width ?? 100}
            widthUnit={props.widthUnit}
            height={props.height ?? 50}
            heightUnit={props.heightUnit}
            showGrid={props.showGrid}
            gridBorderColor={props.gridBorderColor}
            gridBorderWidth={props.gridBorderWidth ?? 1}
            gridCellHeight={props.gridCellHeight ?? 50}
            gridCellWidth={props.gridCellWidth ?? 50}
            penColor={props.penColor}
            penType={props.penType}
            signatureMode={props.signatureMode}
            showModeToggle={false}
            showClearButton={props.showClearButton}
            showSaveButton={props.showSaveButton}
            saveButtonCaption={props.saveButtonCaption || props.saveButtonCaptionDefault}
            saveButtonCaptionDefault={props.saveButtonCaptionDefault}
            isSaveEnabled={true}
            showHeader={props.showHeader}
            headerText={props.headerText || props.headerTextDefault}
            showWatermark={props.showWatermark}
            watermarkText={props.watermarkAttribute || "Watermark"}
            isWatermarkReadOnly={true}
            typeFontFamily={props.typeFontFamily}
            typeFontSize={props.typeFontSize ?? 32}
            typePlaceholder={props.typePlaceholder}
            clearSignature={false}
            readOnly={true}
        />
    );
}

export function getPreviewCss(): string {
    return require("./ui/Signature.scss");
}
