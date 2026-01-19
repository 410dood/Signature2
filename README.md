# Signature React Compatible

A Mendix pluggable widget that captures signatures (draw or type), stores them as an image document, and offers optional UI controls and metadata fields.

## Widget Description

The Signature widget provides a canvas for users to draw or type a signature, saves the image to a System.Image entity, and supports optional controls such as Clear and Save buttons. It also supports additional configuration such as watermark text, header text, and storing base64 data in a string attribute.

## Key Features

- Draw or type signature modes with optional mode toggle
- Save signature image to a System.Image entity
- Optional Save button with text-template caption and action
- Optional Clear button
- Optional header text (text template with fallback)
- Optional watermark text below the signature
- Optional base64 storage in a string attribute
- Read-only support via standard Mendix editability

## Configuration Summary

- Data source: list data source returning a System.Image (or specialization)
- Optional boolean expression to clear the signature
- Optional base64 attribute (string)
- Optional header text (text template + fallback)
- Optional watermark text (string attribute)
- Optional Save action (microflow/nanoflow) and Save button caption
- Optional Clear button

## Release Notes (1.0.7)

- Added optional Save button with text-template caption and action.
- Added optional Clear button.
- Added optional header text with fallback.
- Added optional watermark text below the signature.
- Added optional base64 string attribute storage.
- Improved save flow to ensure image data is written before the Save action executes.
- Added read-only handling to hide controls when not editable.
- Added lint/format configuration for local tooling.
