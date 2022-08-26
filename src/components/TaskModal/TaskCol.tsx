import MDEditorWithPreview from '@/components/MDEditorWithPreview/MDEditorWithPreview';
import { shortenAccount } from '@/utils/format';
import { useIntl, useModel } from '@@/exports';
import {
  CheckCircleFilled,
  CheckOutlined,
  ClockCircleFilled,
  CloseOutlined,
  EditOutlined,
  IssuesCloseOutlined,
  StopFilled,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import MDEditor from '@uiw/react-md-editor';
import { Button, Col, Input, message, Modal, Row, Space, Tooltip } from 'antd';
import { MacScrollbar } from 'mac-scrollbar';
import { useCallback, useEffect, useState } from 'react';
import styles from './TaskModal.less';

interface TaskColProps {
  visible: boolean;
  onClose: () => void;
}

export default function TaskCol({ visible, onClose }: TaskColProps) {
  const { formatMessage } = useIntl();
  const { getTokenAsync } = useModel('walletModel', (model) => ({
    getTokenAsync: model.getTokenAsync,
  }));
  const { chainType, currentStory, isAuthor } = useModel(
    'storyModel',
    (model) => ({
      chainType: model.chainType,
      currentStory: model.currentStory,
      isAuthor: model.isAuthor,
    }),
  );
  const {
    storyTask,
    runUpdateStoryTask,
    loadingUpdateStoryTask,
    runCancelStoryTask,
  } = useModel('taskModel', (model) => ({
    storyTask: model.storyTask,
    runUpdateStoryTask: model.runUpdateStoryTask,
    loadingUpdateStoryTask: model.loadingUpdateStoryTask,
    runCancelStoryTask: model.runCancelStoryTask,
  }));

  const [edit, setEdit] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    setEdit(false);
  }, [visible]);

  const renderStatus = useCallback((status: API.StoryTaskStatus) => {
    if (!status) return undefined;
    switch (status) {
      case 'Todo':
        return (
          <div style={{ color: '#d89614' }}>
            <ClockCircleFilled style={{ marginRight: 8 }} />
            Todo
          </div>
        );
      case 'Done':
        return (
          <div style={{ color: '#49aa19' }}>
            <CheckCircleFilled style={{ marginRight: 8 }} /> Done
          </div>
        );
      case 'Cancelled':
        return (
          <div style={{ color: '#d32029' }}>
            <StopFilled style={{ marginRight: 8 }} /> Cancelled
          </div>
        );
    }
  }, []);

  const handleClose = useCallback(async () => {
    const token = await getTokenAsync(chainType);
    await runCancelStoryTask(token);
    message.success(formatMessage({ id: 'task-modal.closed' }));
    onClose();
  }, []);

  return (
    <Col flex={'650px'} className={styles.taskCol}>
      <Row
        style={{ marginBottom: 12 }}
        align={'middle'}
        justify={'space-between'}
        gutter={12}
      >
        <Col flex={'auto'}>
          <Input
            className={styles.title}
            value={edit ? newTitle : storyTask?.title}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={!edit || loadingUpdateStoryTask}
            bordered={edit}
          />
        </Col>
        {isAuthor && storyTask?.status === 'Todo' && (
          <Col>
            <Space>
              {edit ? (
                <>
                  <Button
                    size={'large'}
                    type={'text'}
                    disabled={loadingUpdateStoryTask}
                    icon={<CloseOutlined />}
                    onClick={() => setEdit(false)}
                  />
                  <Button
                    size={'large'}
                    loading={loadingUpdateStoryTask}
                    type={'primary'}
                    icon={<CheckOutlined />}
                    onClick={async () => {
                      const token = await getTokenAsync(chainType);
                      await runUpdateStoryTask(newTitle, newDesc, token);
                      setEdit(false);
                      message.success(
                        formatMessage({ id: 'task-modal.updated' }),
                      );
                    }}
                  />
                </>
              ) : (
                <>
                  <Tooltip title={formatMessage({ id: 'task-modal.close' })}>
                    <Button
                      size={'large'}
                      type={'text'}
                      icon={<IssuesCloseOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          centered: true,
                          title: formatMessage({
                            id: 'task-modal.close-confirm',
                          }),
                          onOk: async () => {
                            await handleClose();
                          },
                        });
                      }}
                    />
                  </Tooltip>
                  <Tooltip title={formatMessage({ id: 'task-modal.edit' })}>
                    <Button
                      size={'large'}
                      type={'text'}
                      icon={<EditOutlined />}
                      onClick={() => {
                        setNewTitle(storyTask.title);
                        setNewDesc(storyTask.description);
                        setEdit(true);
                      }}
                    />
                  </Tooltip>
                </>
              )}
            </Space>
          </Col>
        )}
      </Row>
      <div className={styles.infoRow}>
        <div className={styles.infoTitle}>
          {formatMessage({ id: 'task-modal.status' })}
        </div>
        <div className={styles.infoValue}>
          {renderStatus(storyTask?.status)}
        </div>
      </div>
      <div className={styles.infoRow}>
        <div className={styles.infoTitle}>
          {formatMessage({ id: 'task-modal.posted-by' })}
        </div>
        <div className={styles.infoValue}>
          <UserOutlined style={{ marginRight: 8 }} />
          {shortenAccount(currentStory?.author)}
        </div>
      </div>
      <div className={styles.infoRow}>
        <div className={styles.infoTitle}>
          {formatMessage({ id: 'task-modal.submits' })}
        </div>
        <div className={styles.infoValue}>
          <TeamOutlined style={{ marginRight: 8 }} />
          {storyTask?.submits.length || 0}
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        {edit ? (
          <div>
            <MDEditorWithPreview
              value={newDesc}
              onChange={(e) => setNewDesc(e)}
              placeholder={formatMessage({
                id: 'create-task.task-desc.placeholder',
              })}
            />
          </div>
        ) : (
          <MacScrollbar className={styles.desc}>
            <MDEditor.Markdown
              source={storyTask?.description}
              linkTarget={'_blank'}
            />
          </MacScrollbar>
        )}
      </div>
    </Col>
  );
}