import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';

interface TreeNode {
  key: string;
  color: 'red' | 'black';
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

const RBTreeCanvas: React.FC<RBTreeCanvasProps> = ({
  treeData,
  selectedKey = null,
  width = 800,
  height = 600,
  onNodeClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const mouseMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Константы для отрисовки
  const NODE_RADIUS = 40;
  const LEVEL_HEIGHT = 80;
  const MIN_HORIZONTAL_SPACING = 80;

  // Вычисление позиций узлов с улучшенным алгоритмом
  const calculatePositions = useCallback((
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
      y: y
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
          positionedNode.left = calculatePositions(
            node.left, 
            depth + 1, 
            Math.max(minX, leftCenterX - leftWidth / 2),
            leftMaxX
          ) ?? undefined;
        }
        
        if (node.right) {
          const rightCenterX = rightMinX + rightWidth / 2;
          positionedNode.right = calculatePositions(
            node.right, 
            depth + 1, 
            rightMinX,
            Math.min(maxX, rightCenterX + rightWidth / 2)
          ) ?? undefined;
        }
      } else {
        // Если места мало, используем более компактное размещение
        const scale = availableWidth / totalWidth;
        const scaledSpacing = MIN_HORIZONTAL_SPACING * scale;
        
        if (node.left) {
          const leftMaxX = centerX - scaledSpacing / 2;
          positionedNode.left = calculatePositions(
            node.left, 
            depth + 1, 
            minX,
            leftMaxX
          ) ?? undefined;
        }
        
        if (node.right) {
          const rightMinX = centerX + scaledSpacing / 2;
          positionedNode.right = calculatePositions(
            node.right, 
            depth + 1, 
            rightMinX,
            maxX
          ) ?? undefined;
        }
      }
    }

    return positionedNode;
  }, [width]);

  // Подсчет ширины поддерева
  const getSubtreeWidth = useCallback((node: TreeNode | null): number => {
    if (!node) return 0;
    
    if (!node.left && !node.right) {
      return NODE_RADIUS * 2;
    }
    
    const leftWidth = getSubtreeWidth(node.left ?? null);
    const rightWidth = getSubtreeWidth(node.right ?? null);
    
    return Math.max(NODE_RADIUS * 2, leftWidth + rightWidth + MIN_HORIZONTAL_SPACING);
  }, []);

  // Мемоизированное вычисление позиций узлов
  const positionedTree = useMemo(() => {
    if (!treeData) return null;
    return calculatePositions(treeData, 0, 0, width);
  }, [treeData, width, calculatePositions]);

  // Отрисовка линий между узлами
  const drawConnections = useCallback((ctx: CanvasRenderingContext2D, node: TreeNode) => {
    if (!node.x || !node.y) return;

    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;

    if (node.left && node.left.x && node.left.y) {
      ctx.beginPath();
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(node.left.x, node.left.y);
      ctx.stroke();
      drawConnections(ctx, node.left);
    }

    if (node.right && node.right.x && node.right.y) {
      ctx.beginPath();
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(node.right.x, node.right.y);
      ctx.stroke();
      drawConnections(ctx, node.right);
    }
  }, []);

  // Отрисовка узла
  const drawNode = useCallback((ctx: CanvasRenderingContext2D, node: TreeNode) => {
    if (!node.x || !node.y) return;

    const isSelected = selectedKey && node.key === selectedKey;
    const isHovered = hoveredNode === node.key;

    // Цвет узла
    let fillColor = node.color === 'red' ? '#ff4444' : '#333333';
    if (isSelected) {
      fillColor = '#2196f3'; // Синий для выбранного
    } else if (isHovered) {
      fillColor = node.color === 'red' ? '#ff6666' : '#555555';
    }

    // Рисуем круг узла
    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = fillColor;
    ctx.fill();
    
    // Обводка
    ctx.strokeStyle = isSelected ? '#1976d2' : (isHovered ? '#888' : '#222');
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.stroke();

    // Текст ключа (многострочный)
    ctx.fillStyle = 'white';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Разбиваем текст на строки
    const lines = node.key.split('\n');
    const lineHeight = 12;
    const totalHeight = lines.length * lineHeight;
    const startY = (node.y ?? 0) - totalHeight / 2 + lineHeight / 2;

    lines.forEach((line, index) => {
      // node.x and startY are always set in drawNode, но теперь не обрезаем строку
      ctx.fillText(line, node.x!, startY + index * lineHeight);
    });

    // Рекурсивно рисуем дочерние узлы
    if (node.left) drawNode(ctx, node.left);
    if (node.right) drawNode(ctx, node.right);
  }, [selectedKey, hoveredNode]);

  // Поиск узла по координатам (для hover эффекта)
  const findNodeAtPosition = useCallback((
    node: TreeNode | null, 
    x: number, 
    y: number
  ): string | null => {
    if (!node || !node.x || !node.y) return null;

    const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
    if (distance <= NODE_RADIUS) {
      return node.key;
    }

    const leftResult = findNodeAtPosition(node.left || null, x, y);
    if (leftResult) return leftResult;

    const rightResult = findNodeAtPosition(node.right || null, x, y);
    if (rightResult) return rightResult;

    return null;
  }, []);

  // Throttled обработка движения мыши
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (mouseMoveTimeoutRef.current) {
      clearTimeout(mouseMoveTimeoutRef.current);
    }

    mouseMoveTimeoutRef.current = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas || !positionedTree) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const nodeKey = findNodeAtPosition(positionedTree, x, y);
      setHoveredNode(nodeKey);
    }, 16); // ~60fps
  }, [positionedTree, findNodeAtPosition]);

  const handleMouseLeave = useCallback(() => {
    if (mouseMoveTimeoutRef.current) {
      clearTimeout(mouseMoveTimeoutRef.current);
    }
    setHoveredNode(null);
  }, []);

  // Обработка клика
  const handleClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !positionedTree || !onNodeClick) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const nodeKey = findNodeAtPosition(positionedTree, x, y);
    
    if (nodeKey) {
      onNodeClick(nodeKey);
    }
  }, [positionedTree, findNodeAtPosition, onNodeClick]);

  // Очистка timeout при размонтировании
  useEffect(() => {
    return () => {
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }
    };
  }, []);

  // Основная функция отрисовки
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !positionedTree) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Масштабируем canvas для высокой плотности пикселей
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0); // сброс
    ctx.scale(dpr, dpr);

    // Очистка канваса
    ctx.clearRect(0, 0, width, height);

    // Рисуем соединения
    drawConnections(ctx, positionedTree);
    
    // Рисуем узлы поверх соединений
    drawNode(ctx, positionedTree);

  }, [positionedTree, drawConnections, drawNode, width, height]);

  if (!treeData) {
    return (
      <div style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f8f8',
        border: '1px solid #ddd',
        borderRadius: '4px'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#666',
          fontSize: '16px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>
            🌳
          </div>
          <div>Дерево пустое</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            Добавьте данные для отображения структуры дерева
          </div>
        </div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: hoveredNode ? 'pointer' : 'default',
        background: '#fafafa'
      }}
    />
  );
};

// Утилита для конвертации данных из красно-черного дерева в формат для визуализации
function convertRBTreeToVisualTree<T>(
  tree: any, // RedBlackTree instance
  formatNodeLabel?: (key: string, value: T) => string
): TreeNode | null {
  const getNodeData = (node: any): TreeNode | undefined => {
    if (!node || node === tree.NIL) return undefined;

    const label = formatNodeLabel ? formatNodeLabel(node.key, node.value) : String(node.key);

    return {
      key: label,
      color: node.color === 0 ? 'red' : 'black', // Color.RED = 0, Color.BLACK = 1
      left: getNodeData(node.left),
      right: getNodeData(node.right)
    };
  };

  try {
    // Получаем корневой узел через рефлексию (так как поле private)
    const rootNode = (tree as any).root;
    if (!rootNode || rootNode === tree.NIL) return null;
    
    return getNodeData(rootNode) ?? null;
  } catch (error) {
    console.warn('Could not access tree root:', error);
    return null;
  }
}

export { convertRBTreeToVisualTree };
export default RBTreeCanvas;