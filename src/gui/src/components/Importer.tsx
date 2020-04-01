import React from 'react'
import { IImporterModelState, connect, Dispatch } from 'umi';
import { Button, message, Upload, Alert, Modal } from 'antd'
import { DownOutlined, RedoOutlined, ExportOutlined, DeleteOutlined, FileAddOutlined, ImportOutlined } from '@ant-design/icons';
import u from '@/utils/u';
const { Dragger } = Upload;

interface IPageProps {
    db: number;
    dispatch: Dispatch;
}

class Importer extends React.Component<IPageProps> {
    showUploader = () => {
        const props = {
            name: 'file',
            action: u.getAPIAddress() + "/import/file?db=" + encodeURIComponent(this.props.selectedDB),
            accept: '.rmd',
            customRequest: (options: any) => {
                const data = new FormData()
                data.append('file', options.file)

                this.props.dispatch({
                    type: 'importer/uploadFile',
                    db: this.props.db,
                    data,
                    options,
                });
            },
            onChange(info: any) {
                const { status } = info.file;
                if (status === 'done') {
                    message.success(`${info.file.name} import successfully.`);
                    modal.destroy();
                } else if (status === 'error') {
                    message.error(`${info.file.name} upload failed.`);
                }
            },
        };
        const uploader = <Dragger {...props}>
            <p className="ant-upload-text">Click or drag rmd file to this area to upload</p>
            <Alert message="Import rmd file will override existing key(s)" type="warning" showIcon style={{ margin: "5px 10px", fontSize: "12px" }} />
        </Dragger>

        const modal = Modal.info({
            okText: "Close",
            width: 500,
            content: uploader,
            destroyOnClose: true,
        });
    };

    render() {
        return (
            <Button type="default" title="Import" onClick={this.showUploader} size="small"><ImportOutlined /></Button>
        )
    }
}

export default connect(({ impoter }: { impoter: IImporterModelState; }) => ({
    mode: impoter,
}))(Importer);