import ContentEditable, {
  useRefCallback,
} from '@/components/ContentEditable/ContentEditable';
import { IconFont } from '@/components/IconFont/IconFont';
import { useMatch, useModel } from '@@/exports';
import { useIntl } from '@@/plugin-locale';
import { ExclamationCircleOutlined, LeftOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Col, Input, message, Modal, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { history } from 'umi';
import styles from './index.less';

const CmdButton = ({
  icon,
  cmd,
  arg,
}: {
  icon: string;
  cmd: string;
  arg?: string;
}) => {
  return (
    <Button
      onMouseDown={(e) => {
        e.preventDefault();
        document.execCommand(cmd, false, arg);
      }}
      className={styles.cmdButton}
      type={'primary'}
      size={'large'}
      icon={<IconFont type={icon} />}
    />
  );
};

const Edit: React.FC = () => {
  const { formatMessage } = useIntl();
  const match = useMatch('/story/:storyId/chapter/:chapterId/edit');
  const {
    storyId,
    chapterId,
    setChapterId,
    currentChapter,
    chapters,
    setChapters,
  } = useModel('storyModel', (model) => ({
    storyId: model.storyId,
    chapterId: model.chapterId,
    setChapterId: model.setChapterId,
    currentChapter: model.currentChapter,
    chapters: model.chapters,
    setChapters: model.setChapters,
  }));

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(true);
  const [promptVisible, setPromptVisible] = useState(false);
  const [newChapterId, setNewChapterId] = useState(0);

  const handleChange = useRefCallback((evt) => {
    setContent(evt.target.value);
    setSaved(false);
  }, []);

  const handleBlur = useRefCallback(() => {}, [content]);

  useEffect(() => {
    return () => {
      setChapterId(0);
    };
  }, []);

  useEffect(() => {
    const chapterId = match?.params.chapterId;
    if (chapterId) {
      setChapterId(parseInt(chapterId));
      if (parseInt(chapterId) === 0) {
        setNewChapterId(new Date().valueOf());
      }
    }
  }, [match]);

  useEffect(() => {
    if (currentChapter) {
      setTitle(currentChapter.name);
      setContent(currentChapter.content);
    }
  }, [currentChapter]);

  const saveDraft = () => {
    // localStorage.setItem(
    //   title,
    //   JSON.stringify({
    //     title,
    //     content,
    //     timestamp: new Date().valueOf(),
    //   }),
    // );
    const timestamp = new Date().valueOf();
    if (chapterId === 0) {
      const _chapters = [...chapters];
      const idx = _chapters.findIndex(
        (c: API.StoryChapter) => c.id === newChapterId,
      );
      if (idx !== -1) {
        _chapters[idx] = {
          ..._chapters[idx],
          name: title,
          content: content,
          createAt: timestamp,
          updateAt: timestamp,
        };
      } else {
        _chapters.push({
          id: newChapterId,
          name: title,
          content: content,
          createAt: timestamp,
          updateAt: timestamp,
        });
      }
      setChapters(_chapters);
    } else {
      const _chapters = [...chapters];
      const idx = _chapters.findIndex(
        (c: API.StoryChapter) => c.id === chapterId,
      );
      if (idx !== -1) {
        _chapters[idx] = {
          ..._chapters[idx],
          name: title,
          content: content,
          updateAt: timestamp,
        };
      }
      setChapters(_chapters);
    }
    message.success(formatMessage({ id: 'chapter.saved' }));
    setSaved(true);
  };

  const backToStory = () => {
    history.push(`/story/${storyId}`);
  };

  // const getDraft = () => {
  //   try {
  //     const storage = localStorage.getItem(chapterId);
  //     if (storage) {
  //       const { title, content, timestamp } = JSON.parse(storage);
  //       // TODO: 与数据时间戳比较
  //       setTitle(title);
  //       setContent(content);
  //     }
  //   } catch (e) {}
  // };
  //
  // useEffect(() => {
  //   !!chapterId && getDraft();
  // }, [chapterId]);

  return (
    <PageContainer
      style={{ margin: '0 88px', position: 'relative' }}
      title={false}
      ghost
    >
      <Helmet
        title={
          currentChapter?.name || formatMessage({ id: 'chapter.new-chapter' })
        }
      />
      <Row align={'middle'} justify={'space-between'} className={styles.header}>
        <Col>
          <Button
            shape={'circle'}
            size={'large'}
            icon={<LeftOutlined />}
            onClick={() => {
              if (saved) {
                backToStory();
              } else {
                setPromptVisible(true);
              }
            }}
          />
        </Col>
        <Col>
          <Button size={'large'} type={'primary'} onClick={saveDraft}>
            {formatMessage({ id: 'chapter.save-draft' })}
          </Button>
        </Col>
      </Row>
      <div className={styles.container}>
        <Input
          value={title}
          onChange={(e) => {
            setSaved(false);
            setTitle(e.target.value);
          }}
          bordered={false}
          placeholder={formatMessage({ id: 'chapter.title.placeholder' })}
          className={styles.titleInput}
        />
        <ContentEditable
          placeholder={formatMessage({ id: 'chapter.content.placeholder' })}
          html={content}
          onBlur={handleBlur}
          onChange={handleChange}
          style={{
            fontSize: '1.1rem',
            marginTop: 24,
            marginBottom: 256,
          }}
        />
      </div>
      <div className={styles.cmdButtonRow1}>
        <CmdButton cmd={'bold'} icon={'icon-bold'} />
        <CmdButton cmd={'italic'} icon={'icon-italic'} />
        <CmdButton cmd={'underline'} icon={'icon-underline'} />
      </div>
      <div className={styles.cmdButtonRow2}>
        <CmdButton cmd={'formatBlock'} arg={'h1'} icon={'icon-heading-h1'} />
        <CmdButton cmd={'formatBlock'} arg={'h2'} icon={'icon-heading-h2'} />
        <CmdButton cmd={'formatBlock'} arg={'h3'} icon={'icon-heading-h3'} />
        <CmdButton cmd={'formatBlock'} arg={'h4'} icon={'icon-heading-h4'} />
        <CmdButton cmd={'formatBlock'} arg={'h5'} icon={'icon-heading-h5'} />
        <CmdButton cmd={'formatBlock'} arg={'h6'} icon={'icon-heading-h6'} />
      </div>

      <Modal
        title={false}
        closable={false}
        footer={false}
        centered={true}
        visible={promptVisible}
        onCancel={() => setPromptVisible(false)}
      >
        <div className={styles.promptTip}>
          <ExclamationCircleOutlined
            style={{ color: '#faad14', marginRight: 12, fontSize: 22 }}
          />
          {formatMessage({ id: 'chapter.save-prompt' })}
        </div>
        <Row justify={'end'} gutter={12}>
          <Col>
            <Button onClick={() => setPromptVisible(false)}>
              {formatMessage({ id: 'chapter.cancel' })}
            </Button>
          </Col>
          <Col>
            <Button danger={true} onClick={() => backToStory()}>
              {formatMessage({ id: 'chapter.discard-and-leave' })}
            </Button>
          </Col>
          <Col>
            <Button
              type={'primary'}
              onClick={() => {
                saveDraft();
                backToStory();
              }}
            >
              {formatMessage({ id: 'chapter.save-draft-and-leave' })}
            </Button>
          </Col>
        </Row>
      </Modal>
    </PageContainer>
  );
};

export default Edit;
