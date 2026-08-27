# Android accessibility contract

Matrigluco treats accessibility semantics as part of each XML screen's contract.

- Interactive controls must expose a minimum 48 dp target. The visible glyph may be smaller.
- Text must wrap at 200% font scale; fixed-height text containers are prohibited.
- Inputs keep visible labels. Validation and asynchronous errors use a suitable live region.
- Headings use accessibility heading semantics. Decorative artwork is excluded from the accessibility tree.
- A compound custom view exposes either one complete semantic node or meaningful children, never both.
- Health status is communicated with text and exact values, not color, shape, or probability alone.
- Long-press, swipe, and custom gestures must have a visible, keyboard-focusable equivalent.
- Skeletons and decorative progress visuals are excluded from TalkBack. Completion is announced only when it materially changes the user's task.
- Light and dark themes require contrast review; disabled state must not be the only way essential information is conveyed.

Manual release QA must cover TalkBack, Switch Access, keyboard navigation, 100/130/150/200% font scales, light/dark themes, and reduced animation on representative API 24 and current devices. A manual result may only be recorded after it has actually been run.
