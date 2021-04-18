import u from '@/u';
import { Space, Form, Input, InputNumber, Row, Col, Button } from 'antd';
import { SaveOutlined, CodeOutlined, BoxPlotOutlined, UndoOutlined } from '@ant-design/icons';

const buildFieldEditor = (props: any) => {
    const { redisKey, field } = props;

    if (redisKey.Type != u.STRING && field != undefined) {
        let input: any;
        let fieldLabel = "field";
        switch (redisKey.Type) {
            case u.LIST:
                fieldLabel = "Index";
                input = <InputNumber precision={0} placeholder={fieldLabel} readOnly={true} style={{ backgroundColor: "#f0f0f0" }} />;
                return <Col>
                    <Form.Item label={fieldLabel} labelAlign="right" name="Field">
                        {input}
                    </Form.Item>
                </Col>;
            case u.ZSET:
                fieldLabel = "Score";
                input = <InputNumber precision={2} placeholder={fieldLabel} />;
                return <Col>
                    <Form.Item label={fieldLabel} labelAlign="right" name="Field">
                        {input}
                    </Form.Item>
                </Col>;
            default:
                input = <Input width="xl" placeholder={fieldLabel} />;
                return <Col lg={6} xl={6} xxl={6}>
                    <Form.Item label={fieldLabel} labelAlign="right" name="Field">
                        {input}
                    </Form.Item>
                </Col>;
        }
    }

    return undefined;
};

const DrawerActionBar = (props: any) => {
    const { formRef } = props;
    // console.log(props);
    const fieldEditor = buildFieldEditor(props);

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