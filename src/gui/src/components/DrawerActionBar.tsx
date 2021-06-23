import u from '@/u';
import { Space, Form, Input, InputNumber, Row, Col, Button, Select, Popconfirm } from 'antd';
import { SaveOutlined, CodeOutlined, BoxPlotOutlined, UndoOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const buildFieldEditor = (props: any) => {
    const { fieldEditorEnabled } = props;

    if (fieldEditorEnabled) {
        return <Col lg={6} xl={6} xxl={6}>
            <Form.Item label="Field" labelAlign="right" name="Field" required>
                <Input width="xl" placeholder="Field" />
            </Form.Item>
        </Col>;
    }

    return undefined;
};

const buildScoreEditor = (props: any) => {
    const { scoreEditorEnabled } = props;

    if (scoreEditorEnabled) {
        return <Col>
            <Form.Item label="Score" labelAlign="right" name="Score">
                <InputNumber precision={6} placeholder="Score" />
            </Form.Item>
        </Col>;
    }

    return undefined;
};

const buildIndexEditor = (props: any) => {
    const { indexEditorEnabled } = props;

    if (indexEditorEnabled) {
        return <Col>
            <Form.Item label="Index" labelAlign="right" name="Index">
                <InputNumber precision={0} placeholder="Index" min={0} readOnly={true} />
            </Form.Item>
        </Col>;
    }

    return undefined;
};

const buildBeautifyButton = (props: any) => {
    const { valueEditorEnabled, formRef } = props;
    if (!valueEditorEnabled)
        return undefined;

    return <Button type="dashed" icon={<CodeOutlined />} className="btn1" onClick={() => {
        let value = formRef.getFieldValue("Value");
        if (u.IsJson(value)) {
            value = u.FormatJson(value);
            formRef.setFieldsValue({ "Value": value });
        } else if (u.IsXml(value)) {
            value = u.FormatXml(value);
            formRef.setFieldsValue({ "Value": value });
        }
    }}>Beautify</Button>;
}

const buildMinifyButton = (props: any) => {
    const { valueEditorEnabled, formRef } = props;
    if (!valueEditorEnabled)
        return undefined;

    return <Button type="dashed" icon={<BoxPlotOutlined />} className="btn1" onClick={() => {
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

const buildDeleteButton = (props: any) => {
    const { deleteButtonEnabled, dispatch, loading } = props;

    return <Popconfirm
        title="Confirm?"
        onConfirm={() => dispatch({ type: "memberListVM/deleteElements" })}
        okText="YES"
        cancelText="CANCEL"
    >
        <Button danger loading={loading} icon={<DeleteOutlined />} className="btn1" disabled={!deleteButtonEnabled}>Delete</Button>
    </Popconfirm>;
}

const DrawerActionBar = (props: any) => {
    const { formRef, newButtonEnabled, keyEditorEnabled, valueEditorEnabled, loading } = props;
    const fieldEditor = buildFieldEditor(props);
    const scoreEditor = buildScoreEditor(props);
    const indexEditor = buildIndexEditor(props);
    const btnBeautify = buildBeautifyButton(props);
    const btnMinify = buildMinifyButton(props);
    const btnDelete = buildDeleteButton(props);

    const form = <Row gutter={8}>
        <Col>
            <Form.Item label="Type" name="Type">
                <Select disabled={true}>
                    <Select.Option value="">{ }</Select.Option>
                    <Select.Option value={u.STRING}>{u.STRING}</Select.Option>
                    <Select.Option value={u.HASH}>{u.HASH}</Select.Option>
                    <Select.Option value={u.LIST}>{u.LIST}</Select.Option>
                    <Select.Option value={u.SET}>{u.SET}</Select.Option>
                    <Select.Option value={u.ZSET}>{u.ZSET}</Select.Option>
                </Select>
            </Form.Item>
        </Col>
        <Col lg={6} xl={6} xxl={6}>
            <Form.Item label="Key" name="Key">
                <Input width="xl" placeholder="Key" readOnly={!keyEditorEnabled} />
            </Form.Item>
        </Col>
        {fieldEditor}
        {scoreEditor}
        {indexEditor}
        <Col>
            <Form.Item label="TTL" labelAlign="right" name="TTL">
                <InputNumber placeholder="TTL" min={-1} precision={0} readOnly={!keyEditorEnabled} />
            </Form.Item>
        </Col>
        <Col>
            <Space>
                <Button type="primary" loading={loading} htmlType="submit" icon={<SaveOutlined />} className="btn1">Save</Button>
                <Button icon={<UndoOutlined />} className="btn1" onClick={() => formRef.resetFields()}>Reset</Button>
            </Space>
        </Col>
        {
            newButtonEnabled ? <Col>
                <Space>
                    <Button icon={<PlusOutlined />} className="btn1" onClick={props.newClicked}>New</Button>
                    {btnDelete}
                </Space>
            </Col> : undefined
        }
        {
            valueEditorEnabled ? <Col>
                <Space>
                    {btnBeautify}
                    {btnMinify}
                </Space>
            </Col> : undefined
        }
    </Row>;

    return form;
};

export default DrawerActionBar;