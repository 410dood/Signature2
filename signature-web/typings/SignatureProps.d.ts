/**
 * This file was generated from Signature.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ListValue, ListActionValue, ListAttributeValue, ListExpressionValue } from "mendix";

export type SignatureModeEnum = "draw" | "type";

export type PenTypeEnum = "fountain" | "ballpoint" | "marker";

export type WidthUnitEnum = "percentage" | "pixels";

export type HeightUnitEnum = "percentageOfWidth" | "pixels" | "percentageOfParent";

export interface SignatureContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    dataSource: ListValue;
    signatureMode: SignatureModeEnum;
    showModeToggle: boolean;
    typeFontFamily: string;
    typeFontSize: number;
    typePlaceholder: string;
    penType: PenTypeEnum;
    penColor: string;
    hasSignatureAttribute?: ListExpressionValue<boolean>;
    showClearButton: boolean;
    showSaveButton: boolean;
    saveButtonCaption?: ListExpressionValue<string>;
    saveButtonCaptionDefault: string;
    onSaveAction?: ListActionValue;
    showHeader: boolean;
    headerText?: ListExpressionValue<string>;
    headerTextDefault: string;
    showWatermark: boolean;
    base64Attribute?: ListAttributeValue<string>;
    watermarkAttribute?: ListAttributeValue<string>;
    widthUnit: WidthUnitEnum;
    width: number;
    heightUnit: HeightUnitEnum;
    height: number;
    showGrid: boolean;
    gridBorderColor: string;
    gridCellHeight: number;
    gridCellWidth: number;
    gridBorderWidth: number;
}

export interface SignaturePreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    dataSource: {} | { caption: string } | { type: string } | null;
    signatureMode: SignatureModeEnum;
    showModeToggle: boolean;
    typeFontFamily: string;
    typeFontSize: number | null;
    typePlaceholder: string;
    penType: PenTypeEnum;
    penColor: string;
    hasSignatureAttribute: string;
    showClearButton: boolean;
    showSaveButton: boolean;
    saveButtonCaption: string;
    saveButtonCaptionDefault: string;
    onSaveAction: {} | null;
    showHeader: boolean;
    headerText: string;
    headerTextDefault: string;
    showWatermark: boolean;
    base64Attribute: string;
    watermarkAttribute: string;
    widthUnit: WidthUnitEnum;
    width: number | null;
    heightUnit: HeightUnitEnum;
    height: number | null;
    showGrid: boolean;
    gridBorderColor: string;
    gridCellHeight: number | null;
    gridCellWidth: number | null;
    gridBorderWidth: number | null;
}
