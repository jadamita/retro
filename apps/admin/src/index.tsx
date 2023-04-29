import * as React from "react";
import { useEffect, useRef, useState, useCallback, MouseEvent } from "react";
import {
  disconnectSocket,
  initiateSocketConnection,
  sendColorChange,
  sendContentChange,
  sendRemove,
  sendUpdate,
  setPositionChange,
  subscribeToUpdates,
} from "./socket";
import { v4 as uuid } from "uuid";
import "./App.css";

interface Position {
  x: number;
  y: number;
}

interface CardProps {
  uuid: string;
  x: number;
  y: number;
  color: string;
  content: string;
  setIsOver: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ColorBlockProps {
  index: number;
  uuid: string;
  color: string;
  borderColor: string;
  setIsOver: React.Dispatch<React.SetStateAction<boolean>>;
  colorName: string;
}

interface RetroCardResponse {
  id: string;
  x: number;
  y: number;
  color: string;
  content: string;
}

interface DragInfo {
  startX: number;
  startY: number;
  top: number;
  left: number;
  width: number;
  height: number;
}

const ColorBlock = (props: ColorBlockProps) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "6px",
        right: `${30 + props.index * 15}px`,
        width: "10px",
        height: "10px",
        backgroundColor: props.color,
        borderStyle: "solid",
        borderColor: props.borderColor,
        borderWidth: "1px",
        cursor: "pointer",
      }}
      onMouseEnter={() => props.setIsOver(true)}
      onMouseLeave={() => props.setIsOver(false)}
      onClick={() => {
        sendColorChange(props.uuid, props.colorName);
      }}
    ></div>
  );
};

const Card = (props: CardProps) => {
  const getTextareaRowCount = (content: string) => {
    if (content.length == 0) return 1;
    return Math.ceil(content.length / 20);
  };

  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>({
    x: props.x,
    y: props.y,
  });
  const [dragInfo, setDragInfo] = useState<DragInfo>({
    startX: 0,
    startY: 0,
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isHoverContent, setIsHoverContent] = useState(false);
  const [isHoverColor, setIsHoverColor] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [content, setContent] = useState(props.content);
  const [contentSize, setContentSize] = useState(
    getTextareaRowCount(props.content)
  );

  useEffect(() => {
    setContent(props.content);
    setContentSize(getTextareaRowCount(props.content));
    setPosition({
      x: props.x,
      y: props.y,
    });
  }, [props.content, props.x, props.y]);

  const getColor = (name: string) => {
    switch (name) {
      case "red":
        return "#c54e47";
      case "orange":
        return "#e3a127";
      case "yellow":
        return "#eed835";
      case "green":
        return "#bfd146";
      case "blue":
        return "#76bae5";
    }
  };

  const getHoverColor = (name: string) => {
    switch (name) {
      case "red":
        return "#9e3e39";
      case "orange":
        return "#b6811f";
      case "yellow":
        return "#beaf2a";
      case "green":
        return "#98a738";
      case "blue":
        return "#5e95b7";
    }
  };

  const getInputHoverColor = (name: string) => {
    switch (name) {
      case "red":
        return "#d0706b";
      case "orange":
        return "#e9b451";
      case "yellow":
        return "#f2e05c";
      case "green":
        return "#cbda6a";
      case "blue":
        return "#91c6ea";
    }
  };

  const handleContentChange = (content: string) => {
    setContent(content);
    sendContentChange(props.uuid, content);
    setContentSize(getTextareaRowCount(content));
  };

  const calculateFor = "topLeft";
  const updateFinalPosition = useCallback(
    (width: any, height: any, x: any, y: any) => {
      const finalX = Math.min(Math.max(0, x), window.innerWidth - width);
      const finalY = Math.min(Math.max(0, y), window.innerHeight - height);
      setPositionChange(props.uuid, finalX, finalY);
      setPosition({
        x: finalX,
        y: finalY,
      });
    },
    [calculateFor]
  );

  const handleMouseUp = (event: MouseEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleMouseDown = (event: MouseEvent) => {
    if (isHoverContent || isHoverColor) return;

    event.preventDefault();

    const { clientX, clientY } = event;
    const { current: draggableElement } = cardRef;

    if (!draggableElement) {
      return;
    }

    const { top, left, width, height }: DOMRect =
      draggableElement.getBoundingClientRect();

    setIsDragging(true);
    setDragInfo({
      startX: clientX,
      startY: clientY,
      top,
      left,
      width,
      height,
    });
  };

  const handleMouseMove = (event: MouseEvent) => {
    const { current: draggableElement } = cardRef;

    if (!isDragging || !draggableElement) return;

    event.preventDefault();
    const { clientX, clientY } = event;
    const position: Position = {
      x: (dragInfo.startX ?? 0) - clientX,
      y: (dragInfo.startY ?? 0) - clientY,
    };

    updateFinalPosition(
      dragInfo.width,
      dragInfo.height,
      (dragInfo.left ?? 0) - position.x,
      (dragInfo.top ?? 0) - position.y
    );
  };

  const handleMouseLeave = (event: MouseEvent) => {
    setIsHover(false);
    props.setIsOver(false);
    setIsDragging(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => {
        setIsHover(true);
        props.setIsOver(true);
      }}
      onMouseLeave={handleMouseLeave}
      key={props.uuid}
      style={{
        cursor: "move",
        height: `${60 + contentSize * 15}px`,
        width: "220px",
        position: "absolute",
        WebkitBoxShadow: "2px 2px 0 #0000001a",
        top: position.y,
        left: position.x,
        fontFamily: "Arial, Helvetica, sans-serif",
        padding: "6px",
        backgroundColor: getColor(props.color),
        borderStyle: isHover ? "solid" : "",
        borderColor: getHoverColor(props.color),
        borderWidth: "2px",
        zIndex: isHover ? 100 : 0,
      }}
    >
      <div
        style={{
          fontSize: "14px",
          position: "absolute",
          top: "15px",
          width: "200px",
        }}
      >
        <textarea
          onMouseEnter={() => setIsHoverContent(true)}
          onMouseLeave={() => setIsHoverContent(false)}
          onChange={(e: any) => handleContentChange(e.target.value)}
          value={content}
          rows={contentSize}
          style={{
            maxWidth: "100%",
            width: "100%",
            border: "none",
            resize: "none",
            background: isHoverContent
              ? getInputHoverColor(props.color)
              : "transparent",
          }}
        />
      </div>
      {isHover ? (
        <div>
          <ColorBlock
            index={1}
            colorName="blue"
            uuid={props.uuid}
            color="#76bae5"
            borderColor="#5e95b7"
            setIsOver={setIsHoverColor}
          />
          <ColorBlock
            index={2}
            colorName="green"
            uuid={props.uuid}
            color="#bfd146"
            borderColor="#98a738"
            setIsOver={setIsHoverColor}
          />
          <ColorBlock
            index={3}
            colorName="yellow"
            uuid={props.uuid}
            color="#eed835"
            borderColor="#beaf2a"
            setIsOver={setIsHoverColor}
          />
          <ColorBlock
            index={4}
            colorName="orange"
            uuid={props.uuid}
            color="#e3a127"
            borderColor="#b6811f"
            setIsOver={setIsHoverColor}
          />
          <ColorBlock
            index={5}
            colorName="red"
            uuid={props.uuid}
            color="#c54e47"
            borderColor="#9e3e39"
            setIsOver={setIsHoverColor}
          />
        </div>
      ) : (
        <></>
      )}
      <span
        style={{
          fontSize: "1rem",
          position: "absolute",
          top: 1,
          right: 5,
          lineHeight: "18px",
          cursor: "pointer",
          color: "#0000003a",
          fontWeight: 600,
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
        onClick={() => {
          sendRemove(props.uuid);
        }}
      >
        x
      </span>
    </div>
  );
};

function App() {
  const [isOver, setIsOver] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<Position>({ x: 0, y: 0 });

  const [list, setList] = useState<RetroCardResponse[]>();

  useEffect(() => {
    initiateSocketConnection();
    subscribeToUpdates((err: any, data: RetroCardResponse[]) => {
      setIsOver(false);
      setList(data);
    });

    const handleMouseMove = (event: any) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      disconnectSocket();
    };
  }, []);

  return (
    <>
      <div
        id="container"
        style={{
          height: "98vh",
        }}
        onDoubleClick={() => {
          if (isOver) return;

          const id = uuid();
          sendUpdate(id, mousePos.x, mousePos.y, "yellow", "");
        }}
      >
        <b>
          Mouse Position: ({mousePos.x}, {mousePos.y})
        </b>
        {list?.map((x) => {
          return (
            <Card
              uuid={x.id}
              key={x.id}
              x={x.x}
              y={x.y}
              color={x.color}
              content={x.content}
              setIsOver={setIsOver}
            />
          );
        })}
      </div>
    </>
  );
}

export default App;
