import u from '@/u';
import { Space, Form, Input, InputNumber, Row, Col, Button } from 'antd';
import { SaveOutlined, CodeOutlined, BoxPlotOutlined, UndoOutlined } from '@ant-design/icons';

const buildFieldEditor = (props: any) => {
    const { redisKey, field } = props;

    if (redisKey.Type == u.HASH && field != undefined) {
        return <Col lg={6} xl={6} xxl={6}>
            <Form.Item label="Field" labelAlign="right" name="Field">
                <Input width="xl" placeholder="Field" />
            </Form.Item>
        </Col>;
    }

    return undefined;
};

const buildScoreEditor = (props: any) => {
    const { redisKey, field } = props;

    if (redisKey.Type == u.ZSET && field != undefined) {
        return <Col>
            <Form.Item label="Score" labelAlign="right" name="Field">
                <InputNumber precision={2} placeholder="Score" />
            </Form.Item>
        </Col>;
    }

    return undefined;
};

const buildIndexEditor = (props: any) => {
    const { redisKey, field } = props;

    if (redisKey.Type == u.LIST && field != undefined) {
        return <Col>
            <Form.Item label="Index" labelAlign="right" name="Field">
                <InputNumber precision={0} placeholder="Index" min={0} readOnly={true} style={{ backgroundColor: "#f0f0f0" }} />
            </Form.Item>
        </Col>;
    }

    return undefined;
};

const DrawerActionBar = (props: any) => {
    const { formRef } = props;
    const fieldEditor = buildFieldEditor(props);
    const scoreEditor = buildScoreEditor(props);
    const indexEditor = buildIndexEditor(props);

    const form = <Row gutter={8}>
        <Col lg={6} xl={6} xxl={6}>
            <Form.Item label="Key" name="Key">
                <Input width="xl" placeholder="Key" />
            </Form.Item>
        </Col>
        {fieldEditor}
        {scoreEditor}
        {indexEditor}
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