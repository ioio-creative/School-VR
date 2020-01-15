import {languages} from 'globals/config';

const localizedData = {
  [languages.english.code]: {
    /* menu */

    "Menu.FileLabel": "File",
    "Menu.File.HomeLabel": "Home",
    "Menu.File.NewLabel": "New",
    "Menu.File.OpenLabel": "Open",
    "Menu.File.ExitLabel": "Exit",

    "Menu.LanguageLabel": "Language",
    "Menu.Language.English": "English",
    "Menu.Language.TraditionalChinese": "繁體中文",

    "Menu.CaptureImageLabel": "Capture Image",
    "Menu.CaptureImage.Normal": "Normal",
    "Menu.CaptureImage.360_2k": "360 (2K)",
    "Menu.CaptureImage.360_4k": "360 (4K)",
    
    "Menu.CaptureVideoLabel": "Capture Video",
    "Menu.CaptureVideo.360_2k": "360 (2K)",
    "Menu.CaptureVideo.360_4k": "360 (4K)",

    /* end of menu */

    /* prompt */

    "Prompt.UnsavedWorkMessage": "You have unsaved changes, are you sure you want to leave?",
    "Prompt.IncompleteRecordingMessage": "Your recording is incomplete, are you sure you want to leave?",
    "Prompt.AutenticationFailTitle": "Authentication",
    "Prompt.AutenticationFailMessage": "Authentication failed. Please contact IOIO Creative or enter your license key.",
    "Alert.AutenticationFailMessage": "Authenication failed.",
    "Alert.AutenticationSuccessMessage": "Authentication succeeded.",
    "Alert.CaptureSavedMessage": "Capture saved.",
    "Alert.ProjectSavedMessage": "Project saved.",    

    /* end of prompt */

    /* navigation */

    "Navigation.SlideSelect.SlideIndexPrefix": "Slide",

    /* end of navigation */

    /* project list page */

    "ProjectOrderSelect.Options.MostRecentLabel": "Most recent",
    "ProjectOrderSelect.Options.LeastRecentLabel": "Least recent",
    "ProjectOrderSelect.Options.ByNameLabel": "By name",
    "ProjectOrderSelect.Options.ByNameReverseLabel": "By name reverse",

    "ProjectItem.Info.LastAccessedLabel": "Last accessed",
    "ProjectItem.Handles.PreviewLabel": "Preview",
    "ProjectItem.Handles.EditLabel": "Edit",
    "ProjectItem.Handles.OptionsLabel": "Options",
    "ProjectItem.Handles.RenameLabel": "Rename",
    "ProjectItem.Handles.CopyToNewLabel": "Copy to New",
    "ProjectItem.Handles.DeleteLabel": "Delete",

    "ProjectSearch.PlaceHolderLabel": "project name",

    /* end of project list page */

    /* editor page */

    "Menu.File.SaveLabel": "Save",
    "Menu.File.SaveAsLabel": "Save As...",

    "Menu.EditLabel": "Edit",
    "Menu.Edit.UndoLabel": "Undo",
    "Menu.Edit.RedoLabel": "Redo",

    "SceneObjects.Camera.DefaultName": "camera",
    "SceneObjects.Entity.DefaultName": "entity",
    "SceneObjects.Plane.DefaultName": "plane",

    "AddThingsPanel.ThreeD.AddBoxTooltip": "Add a box",
    "SceneObjects.Box.DefaultName": "box",
    "AddThingsPanel.ThreeD.AddSphereTooltip": "Add a sphere",
    "SceneObjects.Sphere.DefaultName": "sphere",
    "AddThingsPanel.ThreeD.AddTetrahedronTooltip": "Add a tetrahedron",
    "SceneObjects.Tetrahedron.DefaultName": "tetrahedron",
    "AddThingsPanel.ThreeD.AddPyramidTooltip": "Add a pyramid",
    "SceneObjects.Pyramid.DefaultName": "pyramid",
    "AddThingsPanel.ThreeD.AddCylinderTooltip": "Add a cylinder",
    "SceneObjects.Cylinder.DefaultName": "cylinder",
    "AddThingsPanel.ThreeD.AddConeTooltip": "Add a cone",
    "SceneObjects.Cone.DefaultName": "cone",

    "AddThingsPanel.TwoD.AddImageTooltip": "Add an image",
    "SceneObjects.Image.DefaultName": "image",
    "AddThingsPanel.TwoD.AddVideoTooltip": "Add a video",
    "SceneObjects.Video.DefaultName": "video",
    "AddThingsPanel.TwoD.AddTextTooltip": "Add a text",
    "SceneObjects.Text.DefaultName": "text",
    "AddThingsPanel.TwoD.AddSkyTooltip": "Add a sky",
    "SceneObjects.Sky.DefaultName": "sky",
    "AddThingsPanel.TwoD.AddNavigationTooltip": "Add a navigation",
    "SceneObjects.Navigation.DefaultName": "navigation",

    "PresentationPreparationPanel.ResetViewTooltip": "Reset view",
    "PresentationPreparationPanel.PlayTimelineTooltip": "Play timeline",
    "PresentationPreparationPanel.ShareLabel": "Share",

    "EditThingPanel.AddAnimationLabel": "Click to add animation",
    "EditThingPanel.TransformModes.TranslateLabel": "Position",
    "EditThingPanel.TransformModes.TranslateTooltip": "Translate",
    "EditThingPanel.TransformModes.RotateLabel": "Rotate",
    "EditThingPanel.TransformModes.RotateTooltip": "Rotate",
    "EditThingPanel.TransformModes.ScaleLabel": "Scale",
    "EditThingPanel.TransformModes.ScaleTooltip": "Scale",
    "EditThingPanel.TransformModes.RotateResetLabel": "Reset Rotation",
    "EditThingPanel.TransformModes.RotateResetTooltip": "Reset rotation",
    "EditThingPanel.Color.ColorLabel": "Color",
    "EditThingPanel.Color.OpacityLabel": "Opacity",
    "EditThingPanel.AddTextureLabel": "Add Texture",
    "EditThingPanel.AddVideoLabel": "Add Video",
    "EditThingPanel.Text.TextColorLabel": "Text Color",
    "EditThingPanel.Text.TextOpacityLabel": "Text Opacity",
    "EditThingPanel.Text.TextPlaceholder": "Input your text here",
    "EditThingPanel.Text.SizeLabel": "Size:",
    "EditThingPanel.Navigation.SelectSlideLabel": "Select Slide",
    "EditThingPanel.Navigation.CurrentSlideSuffix": "(This Slide)",

    "TimelinePanel.HeaderLabel": "Timeline",
    "TimelinePanel.AddAnimationLabel": "Add animation +",
    "TimelinePanel.Entity.ContextMenu.CopyLabel": "Copy object",    

    "PreviewPanel.BackLabel": "Back",

    /* end of editor page */

    /* presenter page */

    "PresentationPanel.ExitLabel": "Exit",

    /* end of presenter page */
  },
  [languages.traditionalChinese.code]: {
    /* menu */

    "Menu.FileLabel": "檔案",
    "Menu.File.HomeLabel": "主頁",
    "Menu.File.NewLabel": "開新専案",
    "Menu.File.OpenLabel": "開啟舊檔",
    "Menu.File.ExitLabel": "關閉 School VR",

    "Menu.LanguageLabel": "語言",
    "Menu.Language.English": "English",
    "Menu.Language.TraditionalChinese": "繁體中文",

    "Menu.CaptureImageLabel": "拍攝圖片",
    "Menu.CaptureImage.Normal": "長方",
    "Menu.CaptureImage.360_2k": "360 (2K)",
    "Menu.CaptureImage.360_4k": "360 (4K)",

    "Menu.CaptureVideoLabel": "拍攝視頻",
    "Menu.CaptureVideo.360_2k": "360 (2K)",
    "Menu.CaptureVideo.360_4k": "360 (4K)",

    /* end of menu */

    /* prompt */

    "Prompt.UnsavedWorkMessage": "您有未保存的更改，確定要離開嗎？",
    "Prompt.IncompleteRecordingMessage": "您有未完成的錄影，確定要離開嗎？",
    "Prompt.AutenticationFailTitle": "身份驗證",
    "Prompt.AutenticationFailMessage": "身份驗證失敗。請聯繫IOIO Creative或輸入您的許可證密鑰。",
    "Alert.AutenticationFailMessage": "身份驗證失敗。",
    "Alert.AutenticationSuccessMessage": "身份驗證成功。",
    "Alert.CaptureSavedMessage": "拍攝儲存成功",
    "Alert.ProjectSavedMessage": "専案儲存成功",      

    /* end of prompt */

    /* navigation */

    "Navigation.SlideSelect.SlideIndexPrefix": "投影片",

    /* end of navigation */

    /* project list page */

    "ProjectOrderSelect.Options.MostRecentLabel": "時間最近",
    "ProjectOrderSelect.Options.LeastRecentLabel": "時間最遠",
    "ProjectOrderSelect.Options.ByNameLabel": "檔名順序",
    "ProjectOrderSelect.Options.ByNameReverseLabel": "檔名逆序",

    "ProjectItem.Info.LastAccessedLabel": "上次訪問",
    "ProjectItem.Handles.PreviewLabel": "簡報模式",
    "ProjectItem.Handles.EditLabel": "編輯",
    "ProjectItem.Handles.OptionsLabel": "選項",
    "ProjectItem.Handles.RenameLabel": "改名",
    "ProjectItem.Handles.CopyToNewLabel": "複製到新",
    "ProjectItem.Handles.DeleteLabel": "刪除",

    "ProjectSearch.PlaceHolderLabel": "専案名稱",

    /* end of project list page */

    /* editor page */

    "Menu.File.SaveLabel": "儲存専案",
    "Menu.File.SaveAsLabel": "另存新檔",

    "Menu.EditLabel": "編輯",
    "Menu.Edit.UndoLabel": "上一步",
    "Menu.Edit.RedoLabel": "下一步",

    "SceneObjects.Camera.DefaultName": "相機",
    "SceneObjects.Entity.DefaultName": "物件",
    "SceneObjects.Plane.DefaultName": "平面",

    "AddThingsPanel.ThreeD.AddBoxTooltip": "加立方體",
    "SceneObjects.Box.DefaultName": "立方體",
    "AddThingsPanel.ThreeD.AddSphereTooltip": "加球體",
    "SceneObjects.Sphere.DefaultName": "球體",
    "AddThingsPanel.ThreeD.AddTetrahedronTooltip": "加四面體",
    "SceneObjects.Tetrahedron.DefaultName": "四面體",
    "AddThingsPanel.ThreeD.AddPyramidTooltip": "加金字塔",
    "SceneObjects.Pyramid.DefaultName": "金字塔",
    "AddThingsPanel.ThreeD.AddCylinderTooltip": "加圓柱體",
    "SceneObjects.Cylinder.DefaultName": "圓柱體",
    "AddThingsPanel.ThreeD.AddConeTooltip": "加圓錐體",
    "SceneObjects.Cone.DefaultName": "圓錐體",

    "AddThingsPanel.TwoD.AddImageTooltip": "加圖片",
    "SceneObjects.Image.DefaultName": "圖片",
    "AddThingsPanel.TwoD.AddVideoTooltip": "加影片",
    "SceneObjects.Video.DefaultName": "影片",
    "AddThingsPanel.TwoD.AddTextTooltip": "加文字",
    "SceneObjects.Text.DefaultName": "文字",
    "AddThingsPanel.TwoD.AddSkyTooltip": "加天幕",
    "SceneObjects.Sky.DefaultName": "天幕",
    "AddThingsPanel.TwoD.AddNavigationTooltip": "加隨意門",
    "SceneObjects.Navigation.DefaultName": "隨意門",

    "PresentationPreparationPanel.ResetViewTooltip": "重置視角",
    "PresentationPreparationPanel.PlayTimelineTooltip": "播放時間線",
    "PresentationPreparationPanel.ShareLabel": "分享",

    "EditThingPanel.AddAnimationLabel": "點擊添加動畫",
    "EditThingPanel.TransformModes.TranslateLabel": "移位",
    "EditThingPanel.TransformModes.TranslateTooltip": "移位",
    "EditThingPanel.TransformModes.RotateLabel": "旋轉",
    "EditThingPanel.TransformModes.RotateTooltip": "旋轉",
    "EditThingPanel.TransformModes.ScaleLabel": "縮放",
    "EditThingPanel.TransformModes.ScaleTooltip": "縮放",
    "EditThingPanel.TransformModes.RotateResetLabel": "重置旋轉",
    "EditThingPanel.TransformModes.RotateResetTooltip": "重置\n旋轉",
    "EditThingPanel.Color.ColorLabel": "顏色",
    "EditThingPanel.Color.OpacityLabel": "不透明度",
    "EditThingPanel.AddTextureLabel": "加質地圖片",
    "EditThingPanel.AddVideoLabel": "加影片",
    "EditThingPanel.Text.TextColorLabel": "文字顏色",
    "EditThingPanel.Text.TextOpacityLabel": "文字不透明度",
    "EditThingPanel.Text.TextPlaceholder": "在這裡輸入文字",
    "EditThingPanel.Text.SizeLabel": "文字大小:",
    "EditThingPanel.Navigation.SelectSlideLabel": "選擇投影片",
    "EditThingPanel.Navigation.CurrentSlideSuffix": "(編輯中的投影片)",

    "TimelinePanel.HeaderLabel": "時間線",
    "TimelinePanel.AddAnimationLabel": "添加動畫 +",
    "TimelinePanel.Entity.ContextMenu.CopyLabel": "複製物件",    

    "PreviewPanel.BackLabel": "返回",

    /* end of editor page */

    /* presenter page */

    "PresentationPanel.ExitLabel": "離開簡報模式",

    /* end of presenter page */
  }
}

export default localizedData;