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

const buildForm = (memberEditorState: any, dispatch: any) => {
    let { entry, loading, keyEditorEnabled, fieldEditorEnabled, indexEditorEnabled, scoreEditorEnabled, valueEditorEnabled } = memberEditorState;

    if (loading) {
        return <div style={{ textAlign: "center", marginTop: 20 }}><Spin /></div>
    } else if (entry?.Key != undefined) {

        const [formRef] = Form.useForm();

        let valueEditor: any = undefined;
        if (valueEditorEnabled) {
            valueEditor = buildValueEditor();

            // btnReset = <Button icon={<UndoOutlined />} className="btn1" onClick={() => formRef.resetFields()}>Reset</Button>;
            // btnBeautify = <Button type="dashed" icon={<CodeOutlined />} className="btn1" onClick={() => {
            //     let value = formRef.getFieldValue("Value");
            //     if (u.IsJson(value)) {
            //         value = u.FormatJson(value);
            //         formRef.setFieldsValue({ "Value": value });
            //     } else if (u.IsXml(value)) {
            //         value = u.FormatXml(value);
            //         formRef.setFieldsValue({ "Value": value });
            //     }
            // }}>Beautify</Button>;
            // btnMinify = <Button type="dashed" icon={<BoxPlotOutlined />} className="btn1" onClick={() => {
            //     let value = formRef.getFieldValue("Value");
            //     if (u.IsJson(value)) {
            //         value = u.MinifyJson(value);
            //         formRef.setFieldsValue({ "Value": value });
            //     } else if (u.IsXml(value)) {
            //         value = u.MinifyXml(value, false);
            //         formRef.setFieldsValue({ "Value": value });
            //     }
            // }}>Minify</Button>;
        }

        const initialValues = {
            ...entry
        };
        const form = <Form
            form={formRef}
            onFinish={(values) => dispatch({ type: "memberEditorVM/save", values })}
            initialValues={initialValues}
        >
            <DrawerActionBar formRef={formRef} keyEditorEnabled={keyEditorEnabled} indexEditorEnabled={indexEditorEnabled} scoreEditorEnabled={scoreEditorEnabled} fieldEditorEnabled={fieldEditorEnabled} valueEditorEnabled={valueEditorEnabled}></DrawerActionBar>
            {/* <Form.Item name="Type" hidden={true}>
                <Input />
            </Form.Item> */}
            <Divider orientation="left" plain={true} style={{ margin: "0 0 5px" }}>Value</Divider>
            {valueEditor}
        </Form>;
        useEffect(() => formRef?.resetFields(), [form.props.initialValues]);

        return form;
    }
};

const MemberEditor = (props: any) => {
    const { memberEditorState, memberEditorState: { visible }, dispatch } = props;
    const { title, isNew } = memberEditorState;
    let form: any = undefined;

    if (visible) {
        //////////// form
        form = buildForm(memberEditorState, dispatch);
    }

    return <Drawer
        title={title}
        width="90vw"
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