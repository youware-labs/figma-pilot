/**
 * Shared types for figma-pilot CLI and Plugin
 */

// ============================================
// Bridge Communication Types
// ============================================

export interface BridgeRequest {
  id: string;
  operation: OperationType;
  params: OperationParams;
}

export interface BridgeResponse {
  id: string;
  success: boolean;
  data?: unknown;
  error?: string;
}

// ============================================
// Operation Types
// ============================================

export type OperationType =
  | 'status'
  | 'query'
  | 'create'
  | 'modify'
  | 'delete'
  | 'append'
  | 'list-components'
  | 'to-component'
  | 'create-variants'
  | 'instantiate'
  | 'accessibility'
  | 'bind-token'
  | 'create-token'
  | 'sync-tokens'
  | 'export';

export type OperationParams =
  | StatusParams
  | QueryParams
  | CreateParams
  | ModifyParams
  | DeleteParams
  | AppendParams
  | ListComponentsParams
  | ToComponentParams
  | CreateVariantsParams
  | InstantiateParams
  | AccessibilityParams
  | BindTokenParams
  | CreateTokenParams
  | SyncTokensParams
  | ExportParams;

// ============================================
// Parameter Types
// ============================================

export interface StatusParams {}

export interface QueryParams {
  target: string; // nodeId, 'selection', or 'name:ElementName'
}

export interface CreateParams {
  type: ElementType;
  name?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  parent?: string; // Parent node ID or "selection" to append to selected frame
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
  layout?: LayoutConfig;
  children?: CreateParams[];
  // Text-specific
  content?: string;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  textAlign?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  textColor?: string; // Text color (separate from fill for clarity)
  textAutoResize?: 'WIDTH_AND_HEIGHT' | 'HEIGHT' | 'TRUNCATE' | 'NONE';
  maxWidth?: number; // Max width for text wrapping
  lineHeight?: number; // Line height in pixels
  letterSpacing?: number; // Letter spacing in pixels
  textDecoration?: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';
  textCase?: 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE';
  // Layout sizing (for elements inside auto-layout containers)
  layoutSizingHorizontal?: 'FIXED' | 'HUG' | 'FILL';
  layoutSizingVertical?: 'FIXED' | 'HUG' | 'FILL';
  // Independent corner radius
  topLeftRadius?: number;
  topRightRadius?: number;
  bottomLeftRadius?: number;
  bottomRightRadius?: number;
  // Stroke properties
  strokeAlign?: 'INSIDE' | 'OUTSIDE' | 'CENTER';
  strokeCap?: 'NONE' | 'ROUND' | 'SQUARE' | 'ARROW_LINES' | 'ARROW_EQUILATERAL';
  strokeJoin?: 'MITER' | 'BEVEL' | 'ROUND';
  dashPattern?: number[]; // e.g., [5, 5] for dashed line
  // Effects (shadows, blur)
  effects?: EffectConfig[];
  // Gradient fill
  gradient?: GradientConfig;
  // Transform
  rotation?: number; // Rotation in degrees
  blendMode?: BlendModeType;
  // Frame properties
  clipsContent?: boolean;
  // Constraints (for responsive design)
  constraints?: ConstraintsConfig;
  // Absolute positioning within auto-layout
  layoutPositioning?: 'AUTO' | 'ABSOLUTE';
  // Min/max size constraints
  minWidth?: number;
  maxHeight?: number;
  minHeight?: number;
}

// Effect types
export interface EffectConfig {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  color?: string; // hex with alpha, e.g., "#00000040"
  offset?: { x: number; y: number };
  radius: number;
  spread?: number; // For shadows
  visible?: boolean;
}

// Gradient types
export interface GradientConfig {
  type: 'LINEAR' | 'RADIAL' | 'ANGULAR' | 'DIAMOND';
  stops: GradientStop[];
  // For linear gradient: angle in degrees (0 = left to right, 90 = top to bottom)
  angle?: number;
}

export interface GradientStop {
  position: number; // 0 to 1
  color: string; // hex color
}

// Blend modes
export type BlendModeType =
  | 'PASS_THROUGH'
  | 'NORMAL'
  | 'DARKEN'
  | 'MULTIPLY'
  | 'LINEAR_BURN'
  | 'COLOR_BURN'
  | 'LIGHTEN'
  | 'SCREEN'
  | 'LINEAR_DODGE'
  | 'COLOR_DODGE'
  | 'OVERLAY'
  | 'SOFT_LIGHT'
  | 'HARD_LIGHT'
  | 'DIFFERENCE'
  | 'EXCLUSION'
  | 'HUE'
  | 'SATURATION'
  | 'COLOR'
  | 'LUMINOSITY';

// Constraints for responsive design
export interface ConstraintsConfig {
  horizontal: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'SCALE';
  vertical: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'SCALE';
}

export type ElementType =
  | 'frame'
  | 'text'
  | 'rect'
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'card'
  | 'button'
  | 'form'
  | 'nav'
  | 'input';

export interface LayoutConfig {
  direction?: 'row' | 'column';
  gap?: number;
  padding?: number | PaddingConfig;
  alignItems?: 'start' | 'center' | 'end' | 'baseline'; // Note: for stretch, use layoutSizingVertical/Horizontal: FILL on children
  justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  wrap?: boolean;
}

export interface PaddingConfig {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface ModifyParams {
  target: string;
  name?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
  opacity?: number;
  visible?: boolean;
  locked?: boolean;
  // Text-specific
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  textColor?: string;
  // Layout
  layout?: LayoutConfig;
}

export interface DeleteParams {
  target: string;
}

export interface AppendParams {
  target: string;
  parent: string;
}

export interface AppendResult {
  movedCount: number;
  parentId: string;
  parentName: string;
}

export interface ListComponentsParams {
  filter?: string; // Optional name filter
}

export interface ListComponentsResult {
  components: ComponentInfo[];
}

export interface ComponentInfo {
  id: string;
  name: string;
  description?: string;
  isVariant: boolean;
  variantProperties?: Record<string, string>;
}

export interface ToComponentParams {
  target: string;
  name?: string;
}

export interface CreateVariantsParams {
  target: string;
  property: string;
  values: string[];
}

export interface InstantiateParams {
  component: string; // Component ID or "name:ComponentName"
  x?: number;
  y?: number;
  parent?: string; // Parent node ID, "selection", or "name:ParentName"
}

// Unified accessibility params (replaces EnsureAccessibilityParams and AuditA11yParams)
export interface AccessibilityParams {
  target: string;
  level?: 'AA' | 'AAA'; // WCAG level, default: 'AA'
  autoFix?: boolean; // If true, automatically fix issues
  output?: 'json' | 'text'; // Output format, default: 'json'
}

// Legacy aliases for backward compatibility
export type EnsureAccessibilityParams = AccessibilityParams;
export type AuditA11yParams = AccessibilityParams;

export interface BindTokenParams {
  target: string;
  property: TokenProperty;
  token: string;
}

export type TokenProperty =
  | 'fill'
  | 'stroke'
  | 'fontSize'
  | 'fontFamily'
  | 'fontWeight'
  | 'cornerRadius'
  | 'gap'
  | 'padding';

export interface CreateTokenParams {
  collection: string;
  name: string;
  type: 'COLOR' | 'NUMBER' | 'STRING' | 'BOOLEAN';
  value: string | number | boolean;
}

export interface SyncTokensParams {
  from?: string; // JSON file path
  to?: string; // JSON file path
}

export interface ExportParams {
  target: string;
  format: 'png' | 'svg' | 'pdf' | 'jpg';
  scale?: number;
}

// ============================================
// Result Types
// ============================================

export interface StatusResult {
  connected: boolean;
  pluginVersion: string;
  figmaVersion?: string;
  documentName?: string;
  currentPage?: string;
}

export interface QueryResult {
  node: NodeInfo | null;
  nodes: NodeInfo[]; // For selection target, returns all selected nodes
}

// Legacy alias for backward compatibility
export type SelectionResult = QueryResult;

export interface NodeInfo {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  locked: boolean;
  opacity: number;
  children?: NodeInfo[];
  // Type-specific
  characters?: string; // for text
  fills?: FillInfo[];
  strokes?: StrokeInfo[];
  cornerRadius?: number;
  layoutMode?: string;
  componentId?: string; // for instances
}

export interface FillInfo {
  type: string;
  color?: RGBAColor;
  opacity?: number;
}

export interface StrokeInfo {
  type: string;
  color?: RGBAColor;
  weight?: number;
}

export interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface CreateResult {
  nodeId: string;
  name: string;
  type: string;
}

export interface ModifyResult {
  nodeId: string;
  modified: string[];
}

export interface DeleteResult {
  deleted: string[];
}

export interface ToComponentResult {
  componentId: string;
  name: string;
}

export interface CreateVariantsResult {
  componentSetId: string;
  variants: string[];
  variantCount: number;
}

export interface InstantiateResult {
  instanceId: string;
  componentId: string;
}

export interface AccessibilityIssue {
  type: 'contrast' | 'touch-target' | 'missing-alt' | 'focus-indicator';
  nodeId: string;
  nodeName: string;
  message: string;
  severity: 'error' | 'warning';
  current?: number | string;
  required?: number | string;
  fixed?: boolean;
}

// Unified accessibility result
export interface AccessibilityResult {
  issues: AccessibilityIssue[];
  totalIssues: number;
  fixedCount: number; // Number of issues fixed (if autoFix was true)
  passed: number;
  failed: number;
  warnings: number;
}

// Legacy aliases for backward compatibility
export type EnsureAccessibilityResult = AccessibilityResult;
export type AuditA11yResult = AccessibilityResult;

export interface BindTokenResult {
  nodeId: string;
  property: string;
  token: string;
  previousValue?: string;
}

export interface CreateTokenResult {
  collection: string;
  name: string;
  id: string;
}

export interface SyncTokensResult {
  imported?: number;
  exported?: number;
  collections: string[];
}

export interface ExportResult {
  nodeId: string;
  format: string;
  data: string; // base64 encoded
  size: number;
}

// ============================================
// Design Token Types
// ============================================

export interface DesignToken {
  $type: 'color' | 'dimension' | 'fontFamily' | 'fontWeight' | 'number' | 'string';
  $value: string | number;
  $description?: string;
}

export interface DesignTokenGroup {
  [key: string]: DesignToken | DesignTokenGroup;
}

export interface DesignTokenFile {
  $name?: string;
  $description?: string;
  [key: string]: DesignToken | DesignTokenGroup | string | undefined;
}
