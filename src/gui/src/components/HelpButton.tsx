import React, { Component } from 'react';
import { Button, Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

class HelpButton extends Component {
    render() {
        const tipsLI = [
            <li key="1">Ctrl+C&nbsp;: Copy selection(s)</li>,
            <li key="2">Ctrl+V&nbsp;: Paste</li>,
            <li key="3">Delete&nbsp;: Delete selection(s)</li>,
        ];
        const tipsUL = <ul className="ulist">{tipsLI}</ul>

        return (
            <Popover content={tipsUL} trigger="focus">
                <Button size="small" type="dashed" className="tips"><QuestionCircleOutlined /> Help</Button>
            </Popover>
        )
    }
}

export default HelpButton