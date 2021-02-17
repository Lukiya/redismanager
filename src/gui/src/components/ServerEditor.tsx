import React from 'react';
import { IServerEditorModelState, connect, Dispatch } from 'umi';
import { Drawer, Input, Button, Form, Tooltip, FormInstance } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';

interface IPageProps {
    model: IServerEditorModelState;
    dispatch: Dispatch;
}

class ServerEditor extends React.Component<IPageProps>{

    componentDidMount() {
        console.log(1);
    }
    // formRef = React.createRef<FormInstance>();
    hide = () => {
        this.props.dispatch({
            type: 'serverEditor/hide',
        });
    };

    onFinish = (values: any) => {
        console.log('Success:', values);
    };

    render() {
        const { model } = this.props;
        let hostAddress = "";
        if (model.Editing.Addrs != undefined) {
            hostAddress = model.Editing.Addrs.join("\n");
        }

        const form = <Form
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            // {...layout}
            // name={"basic"}
            // ref={this.formRef}
            initialValues={{
                Name: model.Editing.Name,
                Password: model.Editing.Password,
                Addrs: hostAddress,
            }}
            onFinish={this.onFinish}
        // onFinishFailed={onFinishFailed}
        >
            <Form.Item label="Name" name="Name">
                <Input />
            </Form.Item>

            <Form.Item shouldUpdate name="Addrs" label={
                <span>Server Node(s)&nbsp;
                        <Tooltip title="Each host take one line. Example: localhost:6379">
                        <QuestionCircleOutlined />
                    </Tooltip>
                </span>
            } rules={[
                { required: true, message: 'Server node host address(es) are required.' },
                ({ getFieldValue }) => ({
                    validator(_, value: string) {
                        const regex = /^[a-zA-Z0-9\.]+:\d+?$/gm;
                        const array = value.split("\n");
                        const matches = value.match(regex);
                        // console.log(matches);

                        if (array.length == matches?.length) {
                            return Promise.resolve();
                        }
                        return Promise.reject('Invalid host address(es) format.');
                    },
                }),
            ]}>
                <TextArea rows={10} />
            </Form.Item>

            <Form.Item label="Password" name="Password">
                <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
                <Button type="primary" htmlType="submit">Submit</Button>
            </Form.Item>
        </Form>;

        // console.log(form.props.initialValues);
        return (
            <Drawer
                // title={`${model.EditingEntry.Type} - ${model.EditingEntry.IsNew ? "new" : "edit"}`}
                placement="right"
                width="88vw"
                onClose={this.hide}
                visible={model.Visible}
                destroyOnClose={true}
            >

                {form}

            </Drawer>
        )
    }
}

export default connect(({ serverEditor }: { serverEditor: IServerEditorModelState; }) => ({
    model: serverEditor,
}))(ServerEditor);