import { connect } from "umi";
import { Drawer, Space, Form, Input, InputNumber, Button, Row, Col, Spin } from "antd";
import { SaveOutlined, CodeOutlined, BoxPlotOutlined, UndoOutlined } from '@ant-design/icons';
import { useEffect } from "react";
import u from "@/u";
import DrawerActionBar from "./DrawerActionBar";

const { TextArea } = Input;

const buildValueEditor = (value: string) => {
    let valueLines = value.match(/\n/ig)?.length;
    valueLines = valueLines! <= 30 ? valueLines : 30;
    return <Form.Item name="Value">
        <TextArea rows={(valueLines)}></TextArea>
    </Form.Item>;
};

// const buildFieldEditor = (redisKey: any) => {
//     if (redisKey.Type != u.STRING && redisKey.Field != undefined) {
//         const fieldEditorDisabled = redisKey.Type == u.LIST;
//         let fieldLabel = "field";
//         if (redisKey.Type == u.LIST) {
//             fieldLabel = "Index";
//         }
//         return <Col lg={6} xl={6} xxl={6}>
//             <Form.Item label={fieldLabel} labelAlign="right" name="Filed">
//                 <Input width="xl" placeholder={fieldLabel} readOnly={fieldEditorDisabled} />
//             </Form.Item>
//         </Col>;
//     }

//     return undefined;
// };

const buildForm = (memberEditorState: any, dispatch: any) => {
    const { redisKey, value, loading } = memberEditorState;

    if (loading) {
        return <div style={{ textAlign: "center", marginTop: 20 }}><Spin /></div>
    } else if (redisKey?.Key != undefined) {

        const [formRef] = Form.useForm();

        let valueEditor: any = undefined;
        // let valueEditor: any, btnReset: any, btnBeautify: any, btnMinify: any = undefined;

        if (value != undefined) {
            valueEditor = buildValueEditor(value);

            // btnReset = <Button icon={<UndoOutlined />} style={{ width: 93 }} onClick={() => formRef.resetFields()}>Reset</Button>;
            // btnBeautify = <Button type="dashed" icon={<CodeOutlined />} style={{ width: 93 }} onClick={() => {
            //     let value = formRef.getFieldValue("Value");
            //     if (u.IsJson(value)) {
            //         value = u.FormatJson(value);
            //         formRef.setFieldsValue({ "Value": value });
            //     } else if (u.IsXml(value)) {
            //         value = u.FormatXml(value);
            //         formRef.setFieldsValue({ "Value": value });
            //     }
            // }}>Beautify</Button>;
            // btnMinify = <Button type="dashed" icon={<BoxPlotOutlined />} style={{ width: 93 }} onClick={() => {
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

        // const fieldEditor = buildFieldEditor(redisKey);

        const initialValues = {
            Key: redisKey.Key,
            TTL: redisKey.TTL,
            Value: value,
        };
        const form = <Form
            form={formRef}
            onFinish={(values) => {
                dispatch({ type: "memberEditorVM/save", values });
            }}
            initialValues={initialValues}
        >
            <DrawerActionBar redisKey={redisKey} formRef={formRef}></DrawerActionBar>
            {valueEditor}
        </Form>;
        useEffect(() => formRef?.resetFields(), [form.props.initialValues]);

        return form;
    }
};

const MemberEditor = (props: any) => {
    const { memberEditorState, memberEditorState: { visible }, dispatch } = props;
    const { title } = memberEditorState;
    let form: any = undefined;

    if (visible) {
        //////////// form
        form = buildForm(memberEditorState, dispatch);
    }

    return <Drawer
        title={title}
        width="90vw"
        afterVisibleChange={visible => {
            if (visible) {
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