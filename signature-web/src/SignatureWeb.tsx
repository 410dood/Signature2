import { createElement, ReactElement } from "react";

import { SignatureContainer } from "./components/SignatureContainer";
import { SignatureContainerProps } from "../typings/SignatureProps";

export function SignatureWeb(props: SignatureContainerProps): ReactElement {
    const propsAny = props as SignatureContainerProps & {
        readOnly?: boolean;
        editable?: boolean;
        editability?: string;
    };
    const editability = typeof propsAny.editability === "string" ? propsAny.editability.toLowerCase() : undefined;
    const readOnly =
        propsAny.readOnly ??
        (propsAny.editable === false ? true : undefined) ??
        (propsAny.editable === true ? false : undefined) ??
        (editability === "never" || editability === "read-only" || editability === "readonly" ? true : undefined) ??
        (editability === "always" ? false : undefined) ??
        false;

    return (
        <SignatureContainer
            className={props.class}
            wrapperStyle={props.style}
            readOnly={readOnly}
            dataSource={props.dataSource}
            hasSignatureAttribute={props.hasSignatureAttribute}
            friendlyId={props.name}
            signatureMode={props.signatureMode}
            showModeToggle={props.showModeToggle}
            showClearButton={props.showClearButton}
            showSaveButton={props.showSaveButton}
            saveButtonCaption={props.saveButtonCaption}
            saveButtonCaptionDefault={props.saveButtonCaptionDefault}
            onSaveAction={props.onSaveAction}
            showHeader={props.showHeader}
            headerText={props.headerText}
            headerTextDefault={props.headerTextDefault}
            base64Attribute={props.base64Attribute}
            showWatermark={props.showWatermark}
            watermarkAttribute={props.watermarkAttribute}
            typeFontFamily={props.typeFontFamily}
            typeFontSize={props.typeFontSize}
            typePlaceholder={props.typePlaceholder}
            width={props.width}
            widthUnit={props.widthUnit}
            height={props.height}
            heightUnit={props.heightUnit}
            showGrid={props.showGrid}
            gridBorderColor={props.gridBorderColor}
            gridBorderWidth={props.gridBorderWidth}
            gridCellHeight={props.gridCellHeight}
            gridCellWidth={props.gridCellWidth}
            penColor={props.penColor}
            penType={props.penType}
        />
    );
}
