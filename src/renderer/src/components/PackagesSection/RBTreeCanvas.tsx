import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

interface TreeNode {
  key: string;
  color: "red" | "black";
  left?: TreeNode;
  right?: TreeNode;
  x?: number;
  y?: number;
}

interface RBTreeCanvasProps {
  treeData: TreeNode | null;
  selectedKey?: string | null;
  width?: number;
  height?: number;
  onNodeClick?: (nodeKey: string) => void;
}

interface ViewportState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  draggedNode: string | null;
}

const RBTreeCanvas: React.FC<RBTreeCanvasProps> = ({
  treeData,
  selectedKey = null,
  width = 800,
  height = 600,
  onNodeClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const mouseMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Состояние viewport для масштабирования и панорамирования
  const [viewport, setViewport] = useState<ViewportState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });

  // Состояние перетаскивания
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    draggedNode: null,
  });

  // Константы для отрисовки
  const NODE_RADIUS = 40;
  const LEVEL_HEIGHT = 80;
  const MIN_HORIZONTAL_SPACING = 80;
  const MIN_SCALE = 0.3;
  const MAX_SCALE = 3.0;

  // Вычисление позиций узлов с улучшенным алгоритмом
  const calculatePositions = useCallback(
    (
      node: TreeNode | null,
      depth = 0,
      minX = 0,
      maxX = width
    ): TreeNode | null => {
      if (!node) return null;

      const centerX = (minX + maxX) / 2;
      const y = 50 + depth * LEVEL_HEIGHT;

      const positionedNode: TreeNode = {
        ...node,
        x: centerX,
        y: y,
      };

      if (node.left || node.right) {
        const leftWidth = getSubtreeWidth(node.left ?? null);
        const rightWidth = getSubtreeWidth(node.right ?? null);

        // Улучшенное распределение пространства
        const totalWidth = leftWidth + rightWidth + MIN_HORIZONTAL_SPACING;
        const availableWidth = maxX - minX;

        if (totalWidth <= availableWidth) {
          // Если есть достаточно места, распределяем равномерно
          const leftMaxX = centerX - MIN_HORIZONTAL_SPACING / 2;
          const rightMinX = centerX + MIN_HORIZONTAL_SPACING / 2;

          if (node.left) {
            const leftCenterX = leftMaxX - leftWidth / 2;
            positionedNode.left =
              calculatePositions(
                node.left,
                depth + 1,
                Math.max(minX, leftCenterX - leftWidth / 2),
                leftMaxX
              ) ?? undefined;
          }

          if (node.right) {
            const rightCenterX = rightMinX + rightWidth / 2;
            positionedNode.right =
              calculatePositions(
                node.right,
                depth + 1,
                rightMinX,
                Math.min(maxX, rightCenterX + rightWidth / 2)
              ) ?? undefined;
          }
        } else {
          // Если места мало, масштабируем
          const scale = availableWidth / totalWidth;
          const scaledSpacing = MIN_HORIZONTAL_SPACING * scale;

          if (node.left) {
            const leftMaxX = centerX - scaledSpacing / 2;
            positionedNode.left =
              calculatePositions(node.left, depth + 1, minX, leftMaxX) ??
              undefined;
          }

          if (node.right) {
            const rightMinX = centerX + scaledSpacing / 2;
            positionedNode.right =
              calculatePositions(node.right, depth + 1, rightMinX, maxX) ??
              undefined;
          }
        }
      }

      return positionedNode;
    },
    [width]
  );

  const getSubtreeWidth = useCallback((node: TreeNode | null): number => {
    if (!node) return 0;

    if (!node.left && !node.right) {
      return NODE_RADIUS * 2;
    }

    const leftWidth = getSubtreeWidth(node.left ?? null);
    const rightWidth = getSubtreeWidth(node.right ?? null);

    return Math.max(
      NODE_RADIUS * 2,
      leftWidth + rightWidth + MIN_HORIZONTAL_SPACING
    );
  }, []);

  const positionedTree = useMemo(() => {
    if (!treeData) return null;
    return calculatePositions(treeData, 0, 0, width);
  }, [treeData, width, calculatePositions]);

  // Преобразование координат мыши в координаты канваса с учетом viewport
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    return {
      x: (screenX - viewport.offsetX) / viewport.scale,
      y: (screenY - viewport.offsetY) / viewport.scale,
    };
  }, [viewport]);

  // Преобразование координат канваса в экранные координаты
  const canvasToScreen = useCallback((canvasX: number, canvasY: number) => {
    return {
      x: canvasX * viewport.scale + viewport.offsetX,
      y: canvasY * viewport.scale + viewport.offsetY,
    };
  }, [viewport]);

  const drawConnections = useCallback(
    (ctx: CanvasRenderingContext2D, node: TreeNode) => {
      if (!node.x || !node.y) return;

      const drawCurvedLine = (fromX: number, fromY: number, toX: number, toY: number, isSelected: boolean) => {
        // Преобразуем координаты в экранные
        const fromScreen = canvasToScreen(fromX, fromY);
        const toScreen = canvasToScreen(toX, toY);

        ctx.beginPath();
        ctx.moveTo(fromScreen.x, fromScreen.y);
        
        // Вычисляем контрольные точки для кривой Безье с более плавным изгибом
        const dx = toScreen.x - fromScreen.x;
        const dy = toScreen.y - fromScreen.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const curveFactor = Math.min(0.4, distance / 200); // Адаптивный изгиб
        
        const controlX1 = fromScreen.x + dx * curveFactor;
        const controlY1 = fromScreen.y + dy * 0.1;
        const controlX2 = toScreen.x - dx * curveFactor;
        const controlY2 = toScreen.y - dy * 0.1;
        
        ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, toScreen.x, toScreen.y);
        
        // Настройка стиля линии в зависимости от состояния
        if (isSelected) {
          ctx.strokeStyle = "#2196f3";
          ctx.lineWidth = 3 * viewport.scale;
        } else {
          ctx.strokeStyle = "#666";
          ctx.lineWidth = 2 * viewport.scale;
        }
        
        ctx.stroke();
      };

      if (node.left && node.left.x && node.left.y) {
        const isSelected = Boolean(selectedKey && (node.key === selectedKey || node.left.key === selectedKey));
        drawCurvedLine(node.x, node.y, node.left.x, node.left.y, isSelected);
        drawConnections(ctx, node.left);
      }

      if (node.right && node.right.x && node.right.y) {
        const isSelected = Boolean(selectedKey && (node.key === selectedKey || node.right.key === selectedKey));
        drawCurvedLine(node.x, node.y, node.right.x, node.right.y, isSelected);
        drawConnections(ctx, node.right);
      }
    },
    [selectedKey, viewport, canvasToScreen]
  );

  const drawNode = useCallback(
    (ctx: CanvasRenderingContext2D, node: TreeNode) => {
      if (!node.x || !node.y) return;

      const isSelected = selectedKey && node.key === selectedKey;
      const isHovered = hoveredNode === node.key;
      const isDragging = dragState.draggedNode === node.key;

      // Преобразуем координаты в экранные
      const screenPos = canvasToScreen(node.x, node.y);
      const scaledRadius = NODE_RADIUS * viewport.scale;

      let fillColor = node.color === "red" ? "#ff4444" : "#333333";
      if (isSelected) {
        fillColor = "#2196f3";
      } else if (isHovered) {
        fillColor = node.color === "red" ? "#ff6666" : "#555555";
      } else if (isDragging) {
        fillColor = "#ffaa00";
      }

      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, scaledRadius, 0, 2 * Math.PI);
      ctx.fillStyle = fillColor;
      ctx.fill();

      ctx.strokeStyle = isSelected ? "#1976d2" : isHovered ? "#888" : "#222";
      ctx.lineWidth = (isSelected ? 3 : 2) * viewport.scale;
      ctx.stroke();

      // Рисуем текст
      ctx.fillStyle = "white";
      ctx.font = `bold ${Math.max(8, 10 * viewport.scale)}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const lines = node.key.split("\n");
      const lineHeight = 12 * viewport.scale;
      const totalHeight = lines.length * lineHeight;
      const startY = screenPos.y - totalHeight / 2 + lineHeight / 2;

      lines.forEach((line, index) => {
        ctx.fillText(line, screenPos.x, startY + index * lineHeight);
      });

      if (node.left) drawNode(ctx, node.left);
      if (node.right) drawNode(ctx, node.right);
    },
    [selectedKey, hoveredNode, dragState.draggedNode, viewport, canvasToScreen]
  );

  const findNodeAtPosition = useCallback(
    (node: TreeNode | null, x: number, y: number): string | null => {
      if (!node || !node.x || !node.y) return null;

      const screenPos = canvasToScreen(node.x, node.y);
      const distance = Math.sqrt((x - screenPos.x) ** 2 + (y - screenPos.y) ** 2);
      const scaledRadius = NODE_RADIUS * viewport.scale;
      
      if (distance <= scaledRadius) {
        return node.key;
      }

      const leftResult = findNodeAtPosition(node.left || null, x, y);
      if (leftResult) return leftResult;

      const rightResult = findNodeAtPosition(node.right || null, x, y);
      if (rightResult) return rightResult;

      return null;
    },
    [viewport, canvasToScreen]
  );

  // Обработчики мыши
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }

      mouseMoveTimeoutRef.current = setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas || !positionedTree) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (dragState.isDragging) {
          // Панорамирование
          const deltaX = x - dragState.lastX;
          const deltaY = y - dragState.lastY;
          
          setViewport(prev => ({
            ...prev,
            offsetX: prev.offsetX + deltaX,
            offsetY: prev.offsetY + deltaY,
          }));
          
          setDragState(prev => ({
            ...prev,
            lastX: x,
            lastY: y,
          }));
        } else {
          // Обновление hover состояния
          const nodeKey = findNodeAtPosition(positionedTree, x, y);
          setHoveredNode(nodeKey);
        }
      }, 16); // ~60fps
    },
    [positionedTree, findNodeAtPosition, dragState]
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !positionedTree) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const nodeKey = findNodeAtPosition(positionedTree, x, y);

      if (nodeKey) {
        // Начинаем перетаскивание узла
        setDragState({
          isDragging: true,
          startX: x,
          startY: y,
          lastX: x,
          lastY: y,
          draggedNode: nodeKey,
        });
      } else {
        // Начинаем панорамирование
        setDragState({
          isDragging: true,
          startX: x,
          startY: y,
          lastX: x,
          lastY: y,
          draggedNode: null,
        });
      }
    },
    [positionedTree, findNodeAtPosition]
  );

  const handleMouseUp = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !positionedTree || !onNodeClick) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Проверяем, был ли это клик (не перетаскивание)
      const deltaX = Math.abs(x - dragState.startX);
      const deltaY = Math.abs(y - dragState.startY);
      const isClick = deltaX < 5 && deltaY < 5;

      if (isClick && dragState.draggedNode) {
        onNodeClick(dragState.draggedNode);
      }

      setDragState({
        isDragging: false,
        startX: 0,
        startY: 0,
        lastX: 0,
        lastY: 0,
        draggedNode: null,
      });
    },
    [positionedTree, findNodeAtPosition, onNodeClick, dragState]
  );

  const handleMouseLeave = useCallback(() => {
    if (mouseMoveTimeoutRef.current) {
      clearTimeout(mouseMoveTimeoutRef.current);
    }
    setHoveredNode(null);
    setDragState({
      isDragging: false,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      draggedNode: null,
    });
  }, []);

  // Обработчик колесика мыши для масштабирования
  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Вычисляем новый масштаб
      const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, viewport.scale * scaleFactor));

      // Вычисляем новое смещение для зума к курсору
      const scaleRatio = newScale / viewport.scale;
      const newOffsetX = mouseX - (mouseX - viewport.offsetX) * scaleRatio;
      const newOffsetY = mouseY - (mouseY - viewport.offsetY) * scaleRatio;

      setViewport({
        scale: newScale,
        offsetX: newOffsetX,
        offsetY: newOffsetY,
      });
    },
    [viewport]
  );

  // Сброс viewport к центру дерева
  const resetViewport = useCallback(() => {
    setViewport({
      scale: 1,
      offsetX: width / 2,
      offsetY: height / 2,
    });
  }, [width, height]);

  // Обработчик клавиш
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "0":
          resetViewport();
          break;
        case "+":
        case "=":
          setViewport(prev => ({
            ...prev,
            scale: Math.min(MAX_SCALE, prev.scale * 1.2),
          }));
          break;
        case "-":
          setViewport(prev => ({
            ...prev,
            scale: Math.max(MIN_SCALE, prev.scale / 1.2),
          }));
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [resetViewport]);

  useEffect(() => {
    return () => {
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !positionedTree) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0); // сброс
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    drawConnections(ctx, positionedTree);
    drawNode(ctx, positionedTree);
  }, [positionedTree, drawConnections, drawNode, width, height]);

  if (!treeData) {
    return (
      <div
        style={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f8f8",
          border: "1px solid #ddd",
          borderRadius: "4px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "#666",
            fontSize: "16px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.3 }}>
            🌳
          </div>
          <div>Дерево пустое</div>
          <div style={{ fontSize: "14px", marginTop: "8px" }}>
            Добавьте данные для отображения структуры дерева
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        style={{
          border: "1px solid #ddd",
          borderRadius: "4px",
          cursor: dragState.isDragging 
            ? (dragState.draggedNode ? "grabbing" : "move") 
            : hoveredNode 
            ? "pointer" 
            : "default",
          background: "#fafafa",
        }}
      />
      
      {/* Панель управления */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        <button
          onClick={resetViewport}
          style={{
            width: "30px",
            height: "30px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            background: "#fff",
            cursor: "pointer",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Сбросить вид (0)"
        >
          🏠
        </button>
        <button
          onClick={() => setViewport(prev => ({
            ...prev,
            scale: Math.min(MAX_SCALE, prev.scale * 1.2),
          }))}
          style={{
            width: "30px",
            height: "30px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            background: "#fff",
            cursor: "pointer",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Увеличить (+)"
        >
          ➕
        </button>
        <button
          onClick={() => setViewport(prev => ({
            ...prev,
            scale: Math.max(MIN_SCALE, prev.scale / 1.2),
          }))}
          style={{
            width: "30px",
            height: "30px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            background: "#fff",
            cursor: "pointer",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Уменьшить (-)"
        >
          ➖
        </button>
      </div>

      {/* Информационная панель */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          background: "rgba(255, 255, 255, 0.9)",
          padding: "8px 12px",
          borderRadius: "4px",
          fontSize: "11px",
          color: "#666",
          border: "1px solid #ddd",
        }}
      >
        <div>Масштаб: {(viewport.scale * 100).toFixed(0)}%</div>
        <div>Перетаскивание: {dragState.draggedNode ? "Узел" : "Панорама"}</div>
        <div>Колесико мыши: Масштаб</div>
        <div>Клавиши: 0=Сброс, +/- = Масштаб</div>
      </div>
    </div>
  );
};

// Утилита для конвертации данных из красно-черного дерева в формат для визуализации
function convertRBTreeToVisualTree<T>(
  tree: any, // RedBlackTree instance
  formatNodeLabel?: (key: string, value: T) => string
): TreeNode | null {
  const getNodeData = (node: any): TreeNode | undefined => {
    if (!node || node === tree.NIL) return undefined;

    const label = formatNodeLabel
      ? formatNodeLabel(node.key, node.value)
      : String(node.key);

    return {
      key: label,
      color: node.color === 0 ? "red" : "black", // Color.RED = 0, Color.BLACK = 1
      left: getNodeData(node.left),
      right: getNodeData(node.right),
    };
  };

  try {
    // Получаем корневой узел через рефлексию (так как поле private)
    const rootNode = (tree as any).root;
    if (!rootNode || rootNode === tree.NIL) return null;

    return getNodeData(rootNode) ?? null;
  } catch (error) {
    console.warn("Could not access tree root:", error);
    return null;
  }
}

export { convertRBTreeToVisualTree };
export default RBTreeCanvas;
