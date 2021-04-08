import { connect } from "umi";
import { Drawer, Space, Form, Input, InputNumber, Button, Row, Col } from "antd";
import { SaveOutlined, CodeOutlined, BoxPlotOutlined, UndoOutlined } from '@ant-design/icons';
import { useEffect } from "react";
import u from "@/u";

const { TextArea } = Input;

const MemberEditor = (props: any) => {
    const { memberEditorState, dispatch } = props;
    const { redisKey, value } = memberEditorState;
    const inited = redisKey?.Key != undefined;
    const hasValue = value != undefined && value != null;
    let form: any, filedEditor: any, valueEditor: any, btnReset: any, btnBeautify: any, btnMinify: any = undefined;

    if (inited) {
        const [formRef] = Form.useForm();

        //////////// form
        const initialValues = {
            Key: redisKey.Key,
            TTL: redisKey.TTL,
            Value: value,
        };

        if (hasValue) {
            let valueLines = value.match(/\n/ig)?.length;
            valueLines = valueLines <= 30 ? valueLines : 30;
            valueEditor = <Form.Item name="Value">
                <TextArea rows={(valueLines)}></TextArea>
            </Form.Item>;

            btnReset = <Button icon={<UndoOutlined />} style={{ width: 93 }} onClick={() => formRef.resetFields()}>Reset</Button>;
            btnBeautify = <Button type="dashed" icon={<CodeOutlined />} style={{ width: 93 }} onClick={() => {
                let value = formRef.getFieldValue("Value");
                if (u.IsJson(value)) {
                    value = u.FormatJson(value);
                    formRef.setFieldsValue({ "Value": value });
                } else if (u.IsXml(value)) {
                    value = u.FormatXml(value);
                    formRef.setFieldsValue({ "Value": value });
                }
            }}>Beautify</Button>;
            btnMinify = <Button type="dashed" icon={<BoxPlotOutlined />} style={{ width: 93 }} onClick={() => {
                let value = formRef.getFieldValue("Value");
                if (u.IsJson(value)) {
                    value = u.MinifyJson(value);
                    formRef.setFieldsValue({ "Value": value });
                } else if (u.IsXml(value)) {
                    value = u.MinifyXml(value, false);
                    formRef.setFieldsValue({ "Value": value });
                }
            }}>Minify</Button>;
        }

        if (redisKey.Type != u.STRING && redisKey.Field) {
            filedEditor = <Col lg={6} xl={6} xxl={6}>
                <Form.Item label="Filed" labelAlign="right" name="Filed">
                    <Input width="xl" placeholder="Filed" onChange={values => console.log(values)} />
                </Form.Item>
            </Col>;
        }


        form = <Form
            form={formRef}
            onFinish={(values) => {
                dispatch({ type: "memberEditorVM/save", values });
            }}
            initialValues={initialValues}
        >
            <Row gutter={8}>
                <Col lg={6} xl={6} xxl={6}>
                    <Form.Item label="Key" name="Key">
                        <Input width="xl" placeholder="Key" />
                    </Form.Item>
                </Col>
                {filedEditor}
                <Col>
                    <Form.Item label="TTL" labelAlign="right" name="TTL">
                        <InputNumber placeholder="TTL" min={-1} precision={0} />
                    </Form.Item>
                </Col>
                <Col>
                    <Space>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} style={{ width: 93 }}>Save</Button>
                        {btnReset}
                    </Space>
                </Col>
                <Col>
                    <Space>
                        {btnBeautify}
                        {btnMinify}
                    </Space>
                </Col>
            </Row>
            {valueEditor}
        </Form>;

        useEffect(() => formRef?.resetFields(), [form.props.initialValues]);
    }


    return <Drawer
        title="Key Editor"
        width="90vw"
        afterVisibleChange={visible => {
            if (visible) {
                dispatch({ type: "memberEditorVM/load" });
            }
        }}
        onClose={() => dispatch({ type: "memberEditorVM/hide" })}
        visible={memberEditorState.visible}
    >
        {form}
    </Drawer>
};

// export default EntryEditor
export default connect(({ memberEditorVM }: any) => ({
    memberEditorState: memberEditorVM,
}))(MemberEditor);