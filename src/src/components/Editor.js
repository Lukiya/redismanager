import React, { Component } from 'react';
import { connect } from 'dva';
import { Drawer, Input, Row, Skeleton, Button, Col } from 'antd';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import u from '../utils/utils';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/xml/xml';

class Editor extends Component {
    state = {
        ttl: -1,
    };

    onTTLChange = ({ target: { value } }) => {
        this.props.dispatch({
            type: 'editor/setTTL',
            payload: { ttl: value }
        });
    };

    onKeyChange = ({ target: { value } }) => {
        this.props.dispatch({
            type: 'editor/setKey',
            payload: { key: value }
        });
    };

    onFieldChange = ({ target: { value } }) => {
        this.props.dispatch({
            type: 'editor/setField',
            payload: { field: value }
        });
    };

    onValueChanged = (editor, data, newValue) => {
        this.props.dispatch({
            type: 'editor/setValue',
            payload: { value: newValue }
        });
    };

    beautify = () => {
        this.props.dispatch({
            type: 'editor/beautify',
            payload: { valueEditorMode: this.props.valueEditorMode }
        });
    };

    minify = () => {
        this.props.dispatch({
            type: 'editor/minify',
            payload: { valueEditorMode: this.props.valueEditorMode }
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
        const editingEntry = this.props.editingEntry ?? {};    // prevent undefined error
        const valueEditorMode = !u.isNoW(this.props.valueEditorMode) ? this.props.valueEditorMode : "text";

        const codemirrorOptions = {
            lineNumbers: true,
            theme: 'default',
            mode: valueEditorMode,
        };

        const formatEnabled = this.props.valueEditorEnabled && valueEditorMode !== 'text';

        return (
            <Drawer
                title={`${editingEntry.Type} - ${this.props.editingEntry.isNew ? "new" : "edit"}`}
                placement="right"
                width={this.props.valueEditorWidth}
                onClose={this.hide}
                visible={this.props.visible}
            >
                <Skeleton loading={this.props.isLoading} active>
                    <Row type="flex" gutter={8} align="middle">
                        <Col md={12} lg={8} xl={9} xxl={10}>
                            <Input addonBefore="Key" value={editingEntry.Key} onChange={this.onKeyChange} disabled={!this.props.keyEditorEnabled} onPressEnter={this.save} />
                        </Col>
                        <Col md={12} lg={8} xl={9} xxl={10}>
                            <Input addonBefore="Field" value={editingEntry.Field} onChange={this.onFieldChange} disabled={!this.props.fieldEditorEnabled} onPressEnter={this.save} />
                        </Col>
                        <Col md={12} lg={4} xl={3} xxl={2}>
                            <Input addonBefore="TTL" value={editingEntry.TTL} onChange={this.onTTLChange} disabled={!this.props.ttlEditorEnabled} onPressEnter={this.save} />
                        </Col>
                        <Col md={12} lg={4} xl={3} xxl={2}>
                            <Button type="primary" icon="save" onClick={this.save} loading={this.props.isBusy} title="Save"></Button>
                            <Button type="dashed" icon="code" onClick={this.beautify} title="Beautify" style={{ margin: "0 5px" }} disabled={!formatEnabled}></Button>
                            <Button type="dashed" icon="box-plot" onClick={this.minify} title="Compress" disabled={!formatEnabled}></Button>
                        </Col>
                    </Row>
                    {
                        this.props.valueEditorEnabled ?
                            <div style={{ marginTop: "5px" }}>
                                <CodeMirror value={editingEntry.Value} options={codemirrorOptions} onChange={this.onValueChanged} />
                            </div>
                            : null
                    }
                </Skeleton>
            </Drawer>
        )
    }
}

export default connect(({ editor }) => editor)(Editor)