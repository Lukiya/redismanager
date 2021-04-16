import u from '@/u';
import { Space, Form, Input, InputNumber, Row, Col, Button } from 'antd';
import { SaveOutlined, CodeOutlined, BoxPlotOutlined, UndoOutlined } from '@ant-design/icons';

const buildFieldEditor = (redisKey: any) => {
    if (redisKey.Type != u.STRING && redisKey.Field != undefined) {
        const fieldEditorDisabled = redisKey.Type == u.LIST;
        let fieldLabel = "field";
        switch (redisKey.Type) {
            case u.LIST:
                fieldLabel = "Index";
                break;
            case u.ZSET:
                fieldLabel = "Score";
                break;
        }
        return <Col lg={6} xl={6} xxl={6}>
            <Form.Item label={fieldLabel} labelAlign="right" name="Filed">
                <Input width="xl" placeholder={fieldLabel} readOnly={fieldEditorDisabled} />
            </Form.Item>
        </Col>;
    }

    return undefined;
};

const DrawerActionBar = (props: any) => {
    const { redisKey, formRef } = props;
    const fieldEditor = buildFieldEditor(redisKey);

    const form = <Row gutter={8}>
        <Col lg={6} xl={6} xxl={6}>
            <Form.Item label="Key" name="Key">
                <Input width="xl" placeholder="Key" />
            </Form.Item>
        </Col>
        {fieldEditor}
        <Col>
            <Form.Item label="TTL" labelAlign="right" name="TTL">
                <InputNumber placeholder="TTL" min={-1} precision={0} />
            </Form.Item>
        </Col>
        <Col>
            <Space>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} style={{ width: 93 }}>Save</Button>
                <Button icon={<UndoOutlined />} style={{ width: 93 }} onClick={() => formRef.resetFields()}>Reset</Button>
            </Space>
        </Col>
        {/* <Col>
            <Space>
                {btnBeautify}
                {btnMinify}
            </Space>
        </Col> */}
    </Row>;

    return form;
};

export default DrawerActionBar;