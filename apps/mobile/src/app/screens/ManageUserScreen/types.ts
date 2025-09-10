import React from 'react';

export enum EActionSettingUserProfile {
    Manage = 'Manage',
    TimeOut = 'Timeout',
    Kick = 'Kick',
    Ban = 'Ban',
    ThreadRemove = 'ThreadRemove',
    TransferOwnership = 'TransferOwnership'
}

export interface IProfileSetting {
    label: string;
    value: EActionSettingUserProfile;
    icon: React.JSX.Element;
    action: (action?: EActionSettingUserProfile) => void;
    isShow: boolean;
}


