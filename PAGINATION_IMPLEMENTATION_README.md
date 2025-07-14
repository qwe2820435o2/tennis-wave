# 分页功能实现说明

## 概述

本次更新为网球预约系统实现了完整的分页功能，包括后端API和前端UI组件。分页功能应用于以下模块：

- **网球预订查询** (Tennis Bookings)
- **合作伙伴推荐** (Recommended Partners)
- **用户搜索** (User Search)

## Git分支名称

```
feature/pagination-implementation
```

## 后端实现

### 1. 通用分页DTO

创建了通用的分页数据传输对象：

```csharp
// Models/DTOs/PaginationDto.cs
public class PaginationDto
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = false;
}

public class PaginatedResultDto<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}
```

### 2. 用户模块分页

#### 新增API端点：
- `GET /api/user/paginated` - 获取用户列表（分页）
- `POST /api/user/search` - 搜索用户（分页）
- `GET /api/user/recommended-partners` - 获取推荐合作伙伴（分页）

#### 新增服务方法：
- `GetUsersWithPaginationAsync`
- `SearchUsersWithPaginationAsync`
- `GetRecommendedPartnersWithPaginationAsync`

### 3. 网球预订模块分页

#### 新增API端点：
- `GET /api/tennisbooking/paginated` - 获取预订列表（分页）
- `GET /api/tennisbooking/available` - 获取可用预订（分页）
- `GET /api/tennisbooking/my-bookings` - 获取我的预订（分页）
- `GET /api/tennisbooking/recommended` - 获取推荐预订（分页）

#### 新增服务方法：
- `GetBookingsWithPaginationAsync`
- `GetAvailableBookingsWithPaginationAsync`
- `GetMyBookingsWithPaginationAsync`
- `GetRecommendedBookingsWithPaginationAsync`

### 4. 排序功能

支持多种排序字段：
- **用户排序**: username, email, tennisLevel, preferredLocation, createdAt, updatedAt
- **预订排序**: title, bookingTime, location, type, status, currentParticipants, maxParticipants, createdAt, updatedAt

## 前端实现

### 1. 分页组件

创建了基于shadcnUI的分页组件，符合网站主题色调：

```typescript
// components/ui/pagination.tsx
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
```

### 2. 服务层更新

#### 用户服务 (userService.ts)
```typescript
// 新增分页方法
async getUsersWithPagination(page, pageSize, sortBy, sortDescending)
async searchUsersWithPagination(searchParams)
async getRecommendedPartnersWithPagination(page, pageSize)
```

#### 网球预订服务 (tennisBookingService.ts)
```typescript
// 新增分页方法
async getBookingsWithPagination(page, pageSize, sortBy, sortDescending)
async getAvailableBookingsWithPagination(page, pageSize, sortBy, sortDescending)
async getMyBookingsWithPagination(page, pageSize, sortBy, sortDescending)
async getRecommendedBookingsWithPagination(page, pageSize)
```

### 3. 页面更新

#### 合作伙伴页面 (partners/page.tsx)
- 集成分页组件
- 显示总数和当前页信息
- 支持页面导航

#### 预订页面 (bookings/page.tsx)
- 集成分页组件
- 添加排序功能
- 显示总数和当前页信息
- 支持页面导航

## 功能特性

### 1. 分页导航
- 上一页/下一页按钮
- 页码直接跳转
- 省略号显示（当页数过多时）
- 首页/末页快速跳转

### 2. 排序功能
- 多字段排序支持
- 升序/降序切换
- 排序状态显示

### 3. 信息显示
- 当前页/总页数
- 当前显示数量/总数量
- 加载状态指示

### 4. 响应式设计
- 移动端友好的分页组件
- 自适应布局
- 主题色调一致

## 使用示例

### 后端API调用
```csharp
// 获取分页用户列表
var result = await userService.GetUsersWithPaginationAsync(
    page: 1, 
    pageSize: 20, 
    sortBy: "userName", 
    sortDescending: false
);
```

### 前端服务调用
```typescript
// 获取分页合作伙伴
const result = await userService.getRecommendedPartnersWithPagination(1, 10);

// 获取分页预订
const bookings = await tennisBookingService.getAvailableBookingsWithPagination(
    1, 20, "bookingTime", true
);
```

### 前端组件使用
```tsx
<Pagination className="mt-8">
    <PaginationContent>
        {hasPreviousPage && (
            <PaginationItem>
                <PaginationPrevious onClick={handlePreviousPage} />
            </PaginationItem>
        )}
        {/* 页码按钮 */}
        {hasNextPage && (
            <PaginationItem>
                <PaginationNext onClick={handleNextPage} />
            </PaginationItem>
        )}
    </PaginationContent>
</Pagination>
```

## 性能优化

1. **数据库查询优化**
   - 使用 `Skip()` 和 `Take()` 进行分页
   - 索引优化排序字段
   - 避免 N+1 查询问题

2. **前端性能**
   - 虚拟滚动（大数据量时）
   - 防抖搜索
   - 缓存分页结果

3. **用户体验**
   - 加载状态指示
   - 错误处理
   - 平滑的页面切换

## 主题色调

分页组件完全符合网站的主题色调：
- **主色调**: 绿色 (#16a34a)
- **悬停状态**: 深绿色 (#15803d)
- **暗色模式**: 适配的绿色变体
- **边框和背景**: 灰色系，保持一致性

## 后续扩展

1. **高级筛选**
   - 日期范围筛选
   - 多条件组合筛选
   - 保存筛选条件

2. **导出功能**
   - 分页数据导出
   - 批量操作

3. **实时更新**
   - WebSocket 实时数据更新
   - 自动刷新分页数据

## 测试建议

1. **单元测试**
   - 分页逻辑测试
   - 排序功能测试
   - 边界条件测试

2. **集成测试**
   - API 端点测试
   - 前后端交互测试

3. **用户体验测试**
   - 不同设备测试
   - 性能测试
   - 可访问性测试 