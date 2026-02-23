// components/richtextinput.tsx
import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export type RichTextHandle = {
  focus: () => void;
  blur: () => void;
  applyStyle: (style: 'bold' | 'italic' | 'underline') => void;
  getHTML: () => void;
};

type Props = {
  initialValue?: string;
  placeholder?: string;
  onChangeText: (html: string, text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSelectionChange?: (styles: { bold: boolean; italic: boolean; underline: boolean }) => void;
  textColor?: string;
  backgroundColor?: string;
  placeholderColor?: string;
  fontSize?: number;
};

const RichTextInput = forwardRef<RichTextHandle, Props>(
  (
    {
      initialValue = '',
      placeholder = '',
      onChangeText,
      onFocus,
      onBlur,
      onSelectionChange,
      textColor = '#000000',
      backgroundColor = '#ffffff',
      placeholderColor = '#999999',
      fontSize = 16,
    },
    ref
  ) => {
    const webViewRef = useRef<WebView>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        webViewRef.current?.injectJavaScript(`
          document.getElementById('editor').focus();
          true;
        `);
      },
      blur: () => {
        webViewRef.current?.injectJavaScript(`
          document.getElementById('editor').blur();
          true;
        `);
      },
      applyStyle: (style: 'bold' | 'italic' | 'underline') => {
        const command =
          style === 'bold'
            ? 'bold'
            : style === 'italic'
            ? 'italic'
            : 'underline';
        webViewRef.current?.injectJavaScript(`
          document.execCommand('${command}', false, null);
          checkActiveStyles();
          true;
        `);
      },
      getHTML: () => {
        webViewRef.current?.injectJavaScript(`
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'getHTML',
            html: document.getElementById('editor').innerHTML
          }));
          true;
        `);
      },
    }));

    const handleMessage = (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        switch (data.type) {
          case 'change':
            onChangeText(data.html, data.text);
            break;
          case 'focus':
            onFocus?.();
            break;
          case 'blur':
            onBlur?.();
            break;
          case 'selectionChange':
            onSelectionChange?.(data.styles);
            break;
        }
      } catch (e) {
        console.error('Error parsing message:', e);
      }
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              background-color: ${backgroundColor};
              padding: 0;
              margin: 0;
              overflow: hidden;
            }
            
            #editor {
              width: 100%;
              min-height: 100vh;
              padding: 0;
              outline: none;
              font-size: ${fontSize}px;
              color: ${textColor};
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.4;
              -webkit-user-select: text;
              user-select: text;
            }
            
            #editor:empty:before {
              content: attr(data-placeholder);
              color: ${placeholderColor};
              pointer-events: none;
            }
            
            #editor:focus:before {
              content: '';
            }

            /* Prevent default margins on formatting elements */
            #editor p, #editor div {
              margin: 0;
              padding: 0;
            }
          </style>
        </head>
        <body>
          <div 
            id="editor" 
            contenteditable="true"
            data-placeholder="${placeholder}"
          >${initialValue}</div>
          
          <script>
            const editor = document.getElementById('editor');
            
            // Send changes to React Native
            function notifyChange() {
              const html = editor.innerHTML;
              const text = editor.innerText || '';
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'change',
                html: html,
                text: text
              }));
            }
            
            // Check active styles at cursor
            function checkActiveStyles() {
              const styles = {
                bold: document.queryCommandState('bold'),
                italic: document.queryCommandState('italic'),
                underline: document.queryCommandState('underline')
              };
              
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'selectionChange',
                styles: styles
              }));
            }
            
            // Event listeners
            editor.addEventListener('input', notifyChange);
            
            editor.addEventListener('focus', () => {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'focus'
              }));
              checkActiveStyles();
            });
            
            editor.addEventListener('blur', () => {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'blur'
              }));
            });
            
            // Track cursor position changes
            document.addEventListener('selectionchange', () => {
              const selection = window.getSelection();
              if (selection && editor.contains(selection.anchorNode)) {
                checkActiveStyles();
              }
            });
            
            // Prevent default Enter behavior (creating new divs)
            editor.addEventListener('keydown', (e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                document.execCommand('insertLineBreak');
              }
            });
            
            // Initial style check
            checkActiveStyles();
          </script>
        </body>
      </html>
    `;

    return (
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{ html }}
          onMessage={handleMessage}
          style={styles.webview}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          keyboardDisplayRequiresUserAction={false}
          injectedJavaScript={`
            document.getElementById('editor').focus();
            true;
          `}
        />
      </View>
    );
  }
);

RichTextInput.displayName = 'RichTextInput';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  webview: {
    backgroundColor: 'transparent',
  },
});

export default RichTextInput;
