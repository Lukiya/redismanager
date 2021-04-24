import { connect } from "umi";
import { Drawer, Form, Input, Spin, Divider } from "antd";
import { useEffect } from "react";
import DrawerActionBar from "./DrawerActionBar";

const { TextArea } = Input;

const buildValueEditor = () => {
    const container: any = document.getElementsByClassName('ant-drawer-body');
    let height = 300;
    if (container.length > 0) {
        height = container[0].offsetHeight - 200;
    }
    return <Form.Item name="Value">
        <TextArea style={{ height: height }}></TextArea>
    </Form.Item>;
};

const buildForm = (props: any) => {
    const { memberEditorState: { entry, loading, keyEditorEnabled, fieldEditorEnabled, indexEditorEnabled, scoreEditorEnabled, valueEditorEnabled }, dispatch } = props;

    if (loading) {
        return <div style={{ textAlign: "center", marginTop: 20 }}><Spin /></div>
    } else if (entry?.Key != undefined) {

        const [formRef] = Form.useForm();

        let valueEditor: any = undefined;
        if (valueEditorEnabled) {
            valueEditor = buildValueEditor();
        }

        const initialValues = {
            ...entry
        };
        const form = <Form
            form={formRef}
            onFinish={(values) => dispatch({ type: "memberEditorVM/save", values })}
            initialValues={initialValues}
        >
            <DrawerActionBar formRef={formRef} keyEditorEnabled={keyEditorEnabled} indexEditorEnabled={indexEditorEnabled} scoreEditorEnabled={scoreEditorEnabled} fieldEditorEnabled={fieldEditorEnabled} valueEditorEnabled={valueEditorEnabled}>
            </DrawerActionBar>
            <Divider orientation="left" plain={true} style={{ margin: "0 0 5px" }}>Value</Divider>
            {valueEditor}
        </Form>;
        useEffect(() => formRef?.resetFields(), [form.props.initialValues]);

        return form;
    }
};

const MemberEditor = (props: any) => {
    const { memberEditorState: { title, isNew, visible }, dispatch } = props;
    let form: any = undefined;

    if (visible) {
        //////////// form
        form = buildForm(props);
    }

    return <Drawer
        title={title}
        width="90vw"
        zIndex={1100}
        afterVisibleChange={visible => {
            if (visible && !isNew) {
                dispatch({ type: "memberEditorVM/load" });
            }
        }}
        onClose={() => dispatch({ type: "memberEditorVM/hide" })}
        visible={visible}
    >
        {form}
    </Drawer>
};

// export default EntryEditor
export default connect(({ memberEditorVM }: any) => ({
    memberEditorState: memberEditorVM,
}))(MemberEditor);