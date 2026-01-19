import { CSSProperties, createElement, ReactElement, useCallback, useMemo, useRef } from "react";
import {
    EditableValue,
    ListActionValue,
    ListAttributeValue,
    ListExpressionValue,
    ListValue,
    ObjectItem,
    ValueStatus
} from "mendix";

import { Dimensions } from "./SizeContainer";
import Utils from "../utils/Utils";
import { penOptions, Signature as SignatureCanvas } from "./Signature";

export interface SignatureContainerProps extends Dimensions {
    className: string;
    wrapperStyle?: CSSProperties;
    readOnly: boolean;
    dataSource?: ListValue;
    hasSignatureAttribute?: ListExpressionValue<boolean>;
    friendlyId: string;
    signatureMode: "draw" | "type";
    showModeToggle: boolean;
    showClearButton: boolean;
    showSaveButton: boolean;
    saveButtonCaption?: ListExpressionValue<string>;
    saveButtonCaptionDefault: string;
    onSaveAction?: ListActionValue;
    showHeader: boolean;
    headerText?: ListExpressionValue<string>;
    headerTextDefault: string;
    base64Attribute?: ListAttributeValue<string>;
    showWatermark: boolean;
    watermarkAttribute?: ListAttributeValue<string>;
    typeFontFamily: string;
    typeFontSize: number;
    typePlaceholder: string;
    showGrid: boolean;
    gridBorderColor: string;
    gridCellHeight: number;
    gridCellWidth: number;
    gridBorderWidth: number;
    penType: penOptions;
    penColor: string;
}

function resolveObjectItem(dataSource?: ListValue): ObjectItem | undefined {
    if (!dataSource) {
        return undefined;
    }
    return dataSource.status === ValueStatus.Available ? dataSource.items?.[0] : undefined;
}

export function SignatureContainer(props: SignatureContainerProps): ReactElement {
    const {
        dataSource,
        hasSignatureAttribute,
        wrapperStyle,
        className,
        readOnly,
        friendlyId,
        signatureMode,
        showModeToggle,
        showClearButton,
        showSaveButton,
        saveButtonCaption,
        saveButtonCaptionDefault,
        onSaveAction,
        showHeader,
        headerText,
        headerTextDefault,
        base64Attribute,
        showWatermark,
        watermarkAttribute,
        typeFontFamily,
        typeFontSize,
        typePlaceholder,
        penColor,
        penType,
        showGrid,
        gridBorderColor,
        gridBorderWidth,
        gridCellHeight,
        gridCellWidth,
        width,
        widthUnit,
        height,
        heightUnit
    } = props;
    const mxObject = useMemo<ObjectItem | undefined>(() => resolveObjectItem(dataSource), [dataSource]);
    const signatureAttribute = useMemo(() => {
        if (!mxObject || !hasSignatureAttribute) {
            return undefined;
        }
        return hasSignatureAttribute.get(mxObject);
    }, [hasSignatureAttribute, mxObject]);

    const alertMessage = useMemo(() => {
        if (!mxObject) {
            return `${friendlyId}: Data source is empty.`;
        }
        return "";
    }, [friendlyId, mxObject]);

    const isReadOnly = useMemo(() => {
        return readOnly || !mxObject;
    }, [mxObject, readOnly]);

    const watermarkValue = useMemo<EditableValue<string> | undefined>(() => {
        if (!mxObject || !watermarkAttribute) {
            return undefined;
        }
        return watermarkAttribute.get(mxObject);
    }, [mxObject, watermarkAttribute]);

    const watermarkText = useMemo(() => {
        if (!watermarkValue || watermarkValue.status !== ValueStatus.Available) {
            return "";
        }
        return watermarkValue.value ?? "";
    }, [watermarkValue]);

    const handleWatermarkChange = useCallback(
        (value: string): void => {
            if (!watermarkValue || watermarkValue.status !== ValueStatus.Available || watermarkValue.readOnly) {
                return;
            }
            watermarkValue.setValue(value);
        },
        [watermarkValue]
    );

    const saveButtonCaptionText = useMemo(() => {
        if (!mxObject || !saveButtonCaption) {
            return saveButtonCaptionDefault;
        }
        const captionValue = saveButtonCaption.get(mxObject);
        if (captionValue.status !== ValueStatus.Available) {
            return saveButtonCaptionDefault;
        }
        return captionValue.value !== "" ? captionValue.value : saveButtonCaptionDefault;
    }, [mxObject, saveButtonCaption, saveButtonCaptionDefault]);

    const headerTextValue = useMemo(() => {
        if (!mxObject || !headerText) {
            return headerTextDefault;
        }
        const headerValue = headerText.get(mxObject);
        if (headerValue.status !== ValueStatus.Available) {
            return headerTextDefault;
        }
        return headerValue.value !== "" ? headerValue.value : headerTextDefault;
    }, [mxObject, headerText, headerTextDefault]);

    const saveAction = useMemo(() => {
        if (!mxObject || !onSaveAction) {
            return undefined;
        }
        return onSaveAction.get(mxObject);
    }, [mxObject, onSaveAction]);

    const base64Value = useMemo<EditableValue<string> | undefined>(() => {
        if (!mxObject || !base64Attribute) {
            return undefined;
        }
        return base64Attribute.get(mxObject);
    }, [mxObject, base64Attribute]);

    const setBase64Value = useCallback(
        (value: string): void => {
            if (!base64Value || base64Value.status !== ValueStatus.Available || base64Value.readOnly) {
                return;
            }
            base64Value.setValue(value);
        },
        [base64Value]
    );

    const generateFileName = useCallback((guid: string): string => {
        return `signature-${guid}.png`;
    }, []);

    const saveDocument = useCallback(
        (base64Uri: string, onSuccess?: () => void): void => {
            if (!base64Uri || !mxObject) {
                return;
            }
            mx.data.saveDocument(
                mxObject.id,
                generateFileName(mxObject.id),
                {},
                Utils.convertUrlToBlob(base64Uri),
                () => {
                    if (onSuccess) {
                        onSuccess();
                    }
                },
                (err: { message: string }) => mx.ui.error(`Error saving signature: ${err.message}`)
            );
        },
        [generateFileName, mxObject]
    );

    const lastSignatureDataUrlRef = useRef<string | undefined>();

    const handleSignEnd = useCallback(
        (base64Uri?: string): void => {
            if (!base64Uri || !mxObject || isReadOnly) {
                return;
            }
            lastSignatureDataUrlRef.current = base64Uri;
            setBase64Value(base64Uri);
            saveDocument(base64Uri);
        },
        [isReadOnly, mxObject, saveDocument, setBase64Value]
    );

    const handleSave = useCallback(
        (base64Uri?: string): void => {
            const dataUrl = base64Uri || lastSignatureDataUrlRef.current;
            const executeAction = (): void => {
                if (!isReadOnly && saveAction?.canExecute) {
                    saveAction.execute();
                }
            };
            if (dataUrl) {
                setBase64Value(dataUrl);
                saveDocument(dataUrl, executeAction);
                return;
            }
            executeAction();
        },
        [isReadOnly, saveAction, saveDocument, setBase64Value]
    );

    const clearSignature =
        signatureAttribute?.status === ValueStatus.Available ? signatureAttribute.value === false : false;

    const shouldShowWatermark = showWatermark && !!watermarkValue;

    const shouldShowControls = !isReadOnly;

    return createElement(SignatureCanvas, {
        width,
        widthUnit,
        height,
        heightUnit,
        className,
        wrapperStyle,
        alertMessage,
        clearSignature,
        readOnly: isReadOnly,
        onSignEndAction: handleSignEnd,
        signatureMode,
        showModeToggle: shouldShowControls && showModeToggle,
        showClearButton: shouldShowControls && showClearButton,
        showSaveButton: shouldShowControls && showSaveButton,
        saveButtonCaption: saveButtonCaptionText,
        saveButtonCaptionDefault,
        onSave: handleSave,
        isSaveEnabled: !!saveAction?.canExecute && !isReadOnly,
        showHeader,
        headerText: headerTextValue,
        showWatermark: shouldShowWatermark,
        watermarkText,
        onWatermarkChange: handleWatermarkChange,
        isWatermarkReadOnly: isReadOnly || !!watermarkValue?.readOnly,
        typeFontFamily,
        typeFontSize,
        typePlaceholder,
        penColor,
        penType,
        showGrid,
        gridBorderColor,
        gridBorderWidth,
        gridCellHeight,
        gridCellWidth
    });
}
