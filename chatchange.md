# Mobile App Chat Screen & Manual Input Fixes (`chatchange.md`)

## 1. Prompt Context & User Request

> **User Request**:  
> *"in the mobiel app in the chat screen, that input was stuck behind the keybaord when typing, make it move above the keybaord and when i entering the text it wa snot shoign in input for amnaul inpt correct that in the andorid app. In the chatinput area entered text was not shoign check this deeply and correct it. For this give the compelte prompt and change in the chatchange.md file that we in the previeous"*

---

## 2. Deep Root Cause Analysis

### Issue A: Chat Composer Input Stuck Behind Keyboard
1. **Edge-to-Edge IME Collision**: With Android 14+ / 15 edge-to-edge window configuration (`enableEdgeToEdge()`), legacy Android Manifest `android:windowSoftInputMode="adjustResize"` is ignored by the window manager for in-app views.
2. **Missing Insets Handling on Composer**: The chat bottom composer layout (`b.composerRoot`) lacked its own `OnApplyWindowInsetsListener` to respond dynamically to IME (keyboard) insets, causing the soft keyboard to draw directly over the input bar when focused.
3. **Smooth Scroll Synchronization**: The chat messages RecyclerView was not posting smooth scroll operations when the keyboard opened, causing active messages and typing indicators to get obscured.

### Issue B: Entered Text Not Showing in Chat & Manual Input
1. **StateFlow Bidirectional Loop in Chat**:
   - In `ChatFragment.kt`, `render(state)` was executing on every StateFlow emission.
   - `render()` checked `if (b.composerInput.text.isNullOrEmpty() && state.draft.isNotEmpty()) b.composerInput.setText(state.draft)`.
   - When the user typed the first character or cleared text with backspace, `doAfterTextChanged` dispatched `viewModel.draftChanged()`, which emitted a new state that immediately re-entered `render()` and forcibly overwrote or desynchronized the `EditText` input stream.
2. **Missing Explicit Text Color in Bottom Sheets & Text Input Layouts**:
   - In `QuickAddReadingSheet` (Manual Input), `Orbit.BottomSheetDialog` inherited from `ThemeOverlay.Material3.BottomSheetDialog` without declaring `colorOnSurface`, `android:textColor`, `android:textColorPrimary`, `editTextColor`, and `android:editTextColor`.
   - In `styles.xml`, `Orbit.TextInputLayout.Outlined` and `TextInputEditText` were resolving device-default or uncontrasted text colors against `care_surface_raised` (`#F3EFF1`), rendering typed characters virtually invisible.
   - Missing explicit highlight and cursor drawables further suppressed visual typing feedback.

---

## 3. Detailed File Changes

### 1. `frontend/core/designsystem/src/main/res/values/styles.xml`
* **Changes**: Added explicit text color, edit text color, and surface colors to `Orbit.BottomSheetDialog` and `Orbit.TextInputLayout.Outlined`.
```diff
--- a/frontend/core/designsystem/src/main/res/values/styles.xml
+++ b/frontend/core/designsystem/src/main/res/values/styles.xml
@@ -90,6 +90,12 @@
     <style name="Orbit.BottomSheetDialog" parent="ThemeOverlay.Material3.BottomSheetDialog">
         <item name="bottomSheetStyle">@style/Orbit.BottomSheet</item>
+        <item name="colorSurface">@color/care_surface</item>
+        <item name="colorOnSurface">@color/care_ink</item>
+        <item name="android:textColor">@color/care_ink</item>
+        <item name="android:textColorPrimary">@color/care_ink</item>
+        <item name="android:editTextColor">@color/care_ink</item>
+        <item name="editTextColor">@color/care_ink</item>
     </style>
@@ -133,6 +139,9 @@
         <item name="hintTextColor">@color/care_pink</item>
         <item name="android:textColorHint">@color/care_text_muted</item>
         <item name="boxBackgroundColor">@color/care_surface_raised</item>
+        <item name="android:textColor">@color/care_ink</item>
+        <item name="android:editTextColor">@color/care_ink</item>
+        <item name="editTextColor">@color/care_ink</item>
     </style>
 </resources>
```

---

### 2. `frontend/feature/assistant/src/main/kotlin/com/matrigluco/feature/assistant/presentation/chat/ChatFragment.kt`
* **Changes**:
  1. Added `ViewCompat.setOnApplyWindowInsetsListener` on `b.composerRoot` with IME insets padding so the composer translates smoothly above the keyboard.
  2. Guarded draft restoration with `isDraftRestored` to prevent infinite typing overwrite loops.
  3. Added auto-scroll to the bottom of the message thread when the keyboard appears.
```diff
--- a/frontend/feature/assistant/src/main/kotlin/com/matrigluco/feature/assistant/presentation/chat/ChatFragment.kt
+++ b/frontend/feature/assistant/src/main/kotlin/com/matrigluco/feature/assistant/presentation/chat/ChatFragment.kt
@@ -8,6 +8,9 @@
 import android.view.View
 import android.view.ViewGroup
 import android.widget.Toast
+import androidx.core.view.ViewCompat
+import androidx.core.view.WindowInsetsCompat
+import androidx.core.view.updatePadding
 import androidx.core.widget.doAfterTextChanged
 import androidx.fragment.app.Fragment
 import androidx.fragment.app.viewModels
@@ -33,6 +36,7 @@ class ChatFragment : Fragment() {
     private var binding: FragmentChatBinding? = null
     private var wasSending = false
     private var lastAssistantMessageId: String? = null
+    private var isDraftRestored = false
 
@@ -70,6 +74,24 @@ class ChatFragment : Fragment() {
         b.promptRecyclerView.adapter = promptAdapter
         b.messagesRecyclerView.adapter = chatAdapter
 
+        // Move bottom composer smoothly above keyboard on IME visibility changes
+        ViewCompat.setOnApplyWindowInsetsListener(b.composerRoot) { composerView, insets ->
+            val imeInsets = insets.getInsets(WindowInsetsCompat.Type.ime())
+            val navInsets = insets.getInsets(WindowInsetsCompat.Type.systemBars())
+            val isImeVisible = insets.isVisible(WindowInsetsCompat.Type.ime()) || imeInsets.bottom > 0
+            val bottomPadding = if (isImeVisible) imeInsets.bottom else navInsets.bottom
+            composerView.updatePadding(bottom = bottomPadding.coerceAtLeast(0))
+
+            if (isImeVisible) {
+                b.chatRoot.post {
+                    if (b.messagesRecyclerView.visibility == View.VISIBLE && chatAdapter.itemCount > 0) {
+                        b.messagesRecyclerView.scrollToPosition(chatAdapter.itemCount - 1)
+                    }
+                }
+            }
+            insets
+        }
+
@@ -182,10 +204,13 @@ class ChatFragment : Fragment() {
         b.chatLoading.visibility = if (state.loading && state.messages.isEmpty()) View.VISIBLE else View.GONE
         b.offlineBanner.visibility = if (state.offline) View.VISIBLE else View.GONE
 
-        // Initial draft restore only (when input is currently empty and state has restored a saved draft from store)
-        if (b.composerInput.text.isNullOrEmpty() && state.draft.isNotEmpty() && !state.sending) {
-            b.composerInput.setText(state.draft)
-            b.composerInput.setSelection(state.draft.length)
+        // Initial draft restore ONLY ONCE so live typing and backspaces are never overwritten
+        if (!isDraftRestored && state.draft.isNotEmpty() && !state.sending) {
+            isDraftRestored = true
+            if (b.composerInput.text.isNullOrEmpty()) {
+                b.composerInput.setText(state.draft)
+                b.composerInput.setSelection(state.draft.length)
+            }
         }
```

---

### 3. `frontend/feature/assistant/src/main/res/layout/fragment_chat.xml`
* **Changes**: Added explicit `android:textColorHighlight="@color/care_pink_soft_strong"` to `composerInput`.
```diff
--- a/frontend/feature/assistant/src/main/res/layout/fragment_chat.xml
+++ b/frontend/feature/assistant/src/main/res/layout/fragment_chat.xml
@@ -214,6 +214,7 @@
                 android:textCursorDrawable="@drawable/cursor_care_pink"
                 android:textColor="@color/care_text_primary"
                 android:textColorHint="@color/care_text_tertiary"
+                android:textColorHighlight="@color/care_pink_soft_strong"
                 android:textSize="14.5sp" />
```

---

### 4. `frontend/feature/tracking/src/main/res/layout/sheet_quick_add_reading.xml`
* **Changes**: Added explicit `textColor`, `textColorHint`, `textColorHighlight`, and `textCursorDrawable` across `primaryInputEdit`, `secondaryInputEdit`, and `notesInputEdit`.
```diff
--- a/frontend/feature/tracking/src/main/res/layout/sheet_quick_add_reading.xml
+++ b/frontend/feature/tracking/src/main/res/layout/sheet_quick_add_reading.xml
@@ -181,7 +181,10 @@
                 android:layout_height="wrap_content"
                 android:inputType="numberDecimal"
                 android:textAppearance="@style/Orbit.Text.BodyStrong"
-                android:textColor="@color/care_ink" />
+                android:textColor="@color/care_ink"
+                android:textColorHint="@color/care_text_muted"
+                android:textColorHighlight="@color/care_pink_soft_strong"
+                android:textCursorDrawable="@drawable/cursor_care_pink" />
         </com.google.android.material.textfield.TextInputLayout>
 
         <!-- Secondary Value (Diastolic for BP only) -->
@@ -200,7 +203,10 @@
                 android:layout_height="wrap_content"
                 android:inputType="numberDecimal"
                 android:textAppearance="@style/Orbit.Text.BodyStrong"
-                android:textColor="@color/care_ink" />
+                android:textColor="@color/care_ink"
+                android:textColorHint="@color/care_text_muted"
+                android:textColorHighlight="@color/care_pink_soft_strong"
+                android:textCursorDrawable="@drawable/cursor_care_pink" />
         </com.google.android.material.textfield.TextInputLayout>
 
     </LinearLayout>
@@ -219,7 +225,10 @@
             android:layout_height="wrap_content"
             android:inputType="textCapSentences"
             android:textAppearance="@style/Orbit.Text.Body"
-            android:textColor="@color/care_ink" />
+            android:textColor="@color/care_ink"
+            android:textColorHint="@color/care_text_muted"
+            android:textColorHighlight="@color/care_pink_soft_strong"
+            android:textCursorDrawable="@drawable/cursor_care_pink" />
     </com.google.android.material.textfield.TextInputLayout>
```

---

## 4. Verification Checklist

1. **Keyboard Visibility Test**:
   - Open the Android app and navigate to the **AI Assistant / Chat** screen.
   - Tap the bottom message input field.
   - **Expected**: The keyboard slides up, and the composer input bar smoothly translates upwards to sit directly above the keyboard. No input area or send button is clipped or hidden.
2. **Text Entry in Chat**:
   - Type multiple characters, words, sentences, and perform backspaces.
   - **Expected**: Every entered character is clearly visible with sharp contrast (`#171417` in light mode, `#FFF9FB` in dark mode) and pink blinking cursor.
3. **Manual Health Input Sheet Test**:
   - Navigate to the **Tracking** screen and tap **+ Log Reading**.
   - Type numeric values in the Glucose / BP / Weight input field and add optional notes.
   - **Expected**: Numbers and notes appear immediately with crisp high-contrast text and clear focused stroke colors.
