import React from 'react';
import { IEditorModelState, connect, Loading, Dispatch } from 'umi';
import { Drawer, Input, Row, Skeleton, Button, Col } from 'antd';
import { SaveOutlined, CodeOutlined, BoxPlotOutlined } from '@ant-design/icons';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/xml/xml';
import u from '@/utils/u';

interface IPageProps {
    model: IEditorModelState;
    loading: boolean;
    dispatch: Dispatch;
}

class Editor extends React.Component<IPageProps>{
    onTTLChange = ({ target: { value } }: { target: { value: any } }) => {
        this.props.dispatch({
            type: 'editor/setTTL',
            payload: { ttl: value }
        });
    };

    onKeyChange = ({ target: { value } }: { target: { value: any } }) => {
        this.props.dispatch({
            type: 'editor/setKey',
            payload: { key: value }
        });
    };

    onFieldChange = ({ target: { value } }: { target: { value: any } }) => {
        this.props.dispatch({
            type: 'editor/setField',
            payload: { field: value }
        });
    };

    onValueChanged = (editor: any, data: any, newValue: any) => {
        this.props.dispatch({
            type: 'editor/setValue',
            payload: { value: newValue }
        });
    };

    beautify = () => {
        const { model } = this.props;
        this.props.dispatch({
            type: 'editor/beautify',
            payload: { valueEditorMode: model.ValueEditorMode }
        });
    };

    minify = () => {
        const { model } = this.props;
        this.props.dispatch({
            type: 'editor/minify',
            payload: { valueEditorMode: model.ValueEditorMode }
        });
    };

    save = () => {
        this.props.dispatch({
            type: 'editor/save',
        });
    };

    hide = () => {
        this.props.dispatch({
            type: 'editor/hide',
        });
    }

    render() {
        const { model, loading } = this.props;

        const codemirrorOptions = {
            lineNumbers: true,
            theme: 'default',
            mode: model.ValueEditorMode,
        };

        const formatEnabled = model.ValueEditorEnabled && model.ValueEditorMode !== 'text';

        return (
            <Drawer
                title={`${model.EditingEntry.Type} - ${model.EditingEntry.IsNew ? "new" : "edit"}`}
                placement="right"
                width="88vw"
                onClose={this.hide}
                visible={model.Visible}
            >
                <Skeleton loading={loading} active>
                    <Row gutter={8} align="middle">
                        <Col md={12} lg={8} xl={8} xxl={9}>
                            <Input addonBefore="Key" value={model.EditingEntry.Key} onChange={this.onKeyChange} disabled={!model.KeyEditorEnabled} onPressEnter={this.save} />
                        </Col>
                        <Col md={12} lg={8} xl={8} xxl={9}>
                            <Input addonBefore="TEST" value={model.EditingEntry.Field} onChange={this.onFieldChange} disabled={!model.FieldEditorEnabled} onPressEnter={this.save} />
                        </Col>
                        <Col md={12} lg={3} xl={4} xxl={3}>
                            <Input addonBefore="TTL" value={model.EditingEntry.TTL} onChange={this.onTTLChange} disabled={!model.TTLEditorEnabled} onPressEnter={this.save} />
                        </Col>
                        <Col md={12} lg={5} xl={4} xxl={3}>
                            <Button type="primary" onClick={this.save} loading={loading} title="Save"><SaveOutlined /></Button>
                            <Button type="dashed" onClick={this.beautify} title="Beautify" style={{ margin: "0 5px" }} disabled={!formatEnabled}><CodeOutlined /></Button>
                            <Button type="dashed" onClick={this.minify} title="Compress" disabled={!formatEnabled}><BoxPlotOutlined /></Button>
                        </Col>
                    </Row>
                    {
                        model.ValueEditorEnabled ?
                            <div style={{ marginTop: "5px" }}>
                                <CodeMirror value={model.EditingEntry.Value} options={codemirrorOptions} onChange={this.onValueChanged} />
                            </div>
                            : null
                    }
                </Skeleton>
            </Drawer>
        )
    }
}

export default connect(({ editor, loading }: { editor: IEditorModelState; loading: Loading }) => ({
    model: editor,
    loading: loading.models.editor,
}))(Editor);