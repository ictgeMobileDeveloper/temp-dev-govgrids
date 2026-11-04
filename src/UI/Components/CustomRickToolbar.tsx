import React from 'react';
import {RichToolbar, actions} from 'react-native-pell-rich-editor';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';

interface Props {
  editor: any;
}

const CustomRichToolbar: React.FC<Props> = ({editor}: any) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);

  return (
    <RichToolbar
      editor={editor}
      selector={selector}
      actions={[
        actions.setBold,
        actions.setUnderline,
        actions.setItalic,
        // actions.heading1,
        // actions.insertLine,
        // actions.removeFormat,
        actions.alignLeft,
        actions.alignCenter,
        actions.alignRight,
        actions.alignFull,
        actions.insertBulletsList,
        actions.insertOrderedList,
        // actions.checkboxList,
        actions.insertLink,
        // actions.insertImage,
        // actions.insertVideo,
        // actions.fontSize,
        // actions.setSubscript,
        // actions.setSuperscript,
        // actions.setStrikethrough,
        // actions.indent,
        // actions.outdent,
        // actions.undo,
        // actions.redo,
        // actions.code,
        // actions.table,
        // actions.line,
        // actions.blockquote,
        // actions.keyboard,
      ]}
      // iconMap={{[actions.heading1]: handleHead}}
    />
  );
};

export default CustomRichToolbar;
