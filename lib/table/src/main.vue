<!--表格组件 -->
<template>
  <section class="sp-table">
    <section>
      <el-table
        :data="tableData"
        :size="size"
        :height="height"
        :max-height="maxHeight"
        @select="select"
        @select-all="selectAll"
        v-loading="loading"
        ref="spTableCom">
        <el-table-column
          v-if="isSelection"
          type="selection"
          align="center"
          width="80px"
          :label-class-name="isShowSelectAll?'':'hiddenSelectAll'"
          :selectable="handleSelectable">
        </el-table-column>
        <el-table-column
          v-if="isIndex"
          type="index"
          :label="indexTitle"
          align="center"
          width="80px"
          :index="indexMethod">
        </el-table-column>
        <!-- 数据栏 -->
        <el-table-column
          v-for="item in tableCols"
          :key="item.id"
          :prop="item.prop"
          :label="item.label"
          :width="item.width"
          :min-width="item.minwidth"
          :show-overflow-tooltip="item.overflow ? item.overflow : false"
          :align="item.align ? item.align : 'center'"
          :render-header="item.require ? renderHeader : null"
          :resizable="item.resizable"
          :fixed="item.type === 'Button' || item.type === 'dynamicButton'? 'right' : false"
          :class-name="item.padding ? 'padding-col' : ''"
        >
          <template slot-scope="scope">
            <!-- html -->
            <span v-if="item.type === 'Html'" v-html="scope.row"></span>
            <!-- 按钮 -->
            <span v-if="item.type === 'Button'">
              <template v-for="btn in item.btnList">
                <el-button
                  v-if="btn && (!btn.isHidden || btn.isHidden(scope.row))"
                  :key="btn.id"
                  :disabled="btn.isDisabled && btn.isDisabled(scope.row)"
                  :type="btn.type"
                  :size="btn.size || size"
                  :icon="btn.icon"
                  :style="{color: '#b5002a','max-width': btn.wrap?'42px':'inherit','white-space': btn.wrap?'inherit':'nowrap'}"
                  @click="btn.handle(scope.row)"
                  @keydown.native="listenKeyDown($event)"
                >{{ btn.label }}
                </el-button>
              </template>
            </span>
            <!-- 动态按钮 -->
            <span v-if="item.type === 'dynamicButton'">
              <template v-for="btn in item.btnList">
                <el-button
                  v-if="(btn && (!btn.isHidden || btn.isHidden(scope.row)) )&& !btn.dropDownList"
                  :key="btn.id"
                  :disabled="btn.isDisabled && btn.isDisabled(scope.row)"
                  :type="btn.type"
                  :size="btn.size || size"
                  :icon="btn.icon"
                  @click="btn.handle(scope.row)"
                  :style="{color: '#b5002a'}"
                >{{ btn.label }}</el-button>
                <el-dropdown
                  trigger="click"
                  @command="handleCommand($event,scope.row)"
                  v-if="btn && btn.dropDownList"
                  :key="btn.id">
                  <span class="el-dropdown-link">
                    {{ btn.label }}<i class="el-icon-arrow-down el-icon--right"></i>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <template v-for="ele in btn.dropDownList">
                      <el-dropdown-item
                        v-if="ele && (!ele.isHidden || ele.isHidden(scope.row))"
                        :command="{id:ele.id,row:scope.row}"
                        :key="ele.id">{{ele.label}}</el-dropdown-item>
                    </template>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
            </span>
            <!-- 输入框 -->
            <el-input
              v-if="item.type === 'Input'"
              v-model="scope.row[item.prop]"
              :size="size"
              :disabled="item.isDisabled && item.isDisabled(scope.row)"
              :class="item.setClass && item.setClass(scope.row,scope)"
              @focus="item.focus && item.focus(scope.row)"
              @change="item.change && item.change(scope.row, scope)"
            ></el-input>
            <!-- 下拉框 -->
            <el-select
              v-if="item.type === 'Select'"
              v-model="scope.row[item.prop]"
              :size="size"
              :props="item.props"
              :disabled="item.isDisabled && item.isDisabled(scope.row)"
              @change="item.change && item.change(scope.row)"
            >
              <el-option
                v-for="op in item.options"
                :label="op[item.props.label]"
                :value="op[item.props.value]"
                :key="op[item.props.value]"
              ></el-option>
            </el-select>
            <!-- 单选 -->
            <el-radio-group
              :width="item.width"
              :min-width="item.minwidth"
              v-if="item.type === 'Radio'"
              v-model="scope.row[item.prop]"
              :disabled="item.isDisabled && item.isDisabled(scope.row)"
              @change="item.change && item.change(scope.row)"
            >
              <el-radio
                v-for="(ra,index) in item.radios"
                :label="ra.value"
                :key="index"
              >{{ ra.label }}</el-radio>
            </el-radio-group>
            <!-- 多选下拉 -->
            <el-select
              v-if="item.type === 'multipleSelect'"
              v-model="scope.row[item.prop]"
              :size="size"
              multiple
              :props="item.props"
              @change="item.change && item.change(scope.row)"
            >
              <el-option
                v-for="op in scope.row[item.multipleSelectProp]"
                :label="op[item.props.label]"
                :value="op[item.props.value]"
                :key="op[item.props.value]"
              ></el-option>
            </el-select>
            <!-- 复选框 -->
            <el-checkbox-group
              v-if="item.type === 'Checkbox'"
              v-model="scope.row[item.prop]"
              :disabled="item.isDisabled && item.isDisabled(scope.row)"
              @change="item.change && item.change(scope.row)"
            >
              <el-checkbox
                v-for="ra in item.checkboxs"
                :label="ra.value"
                :key="ra[item.props.value]"
              >{{ ra.label }}</el-checkbox>
            </el-checkbox-group>
            <!-- 评价 -->
            <el-rate
              v-if="item.type === 'Rate'"
              v-model="scope.row[item.prop]"
              :disabled="item.isDisabled && item.isDisabled(scope.row)"
              @change="item.change && item.change(scope.row)"
            ></el-rate>
            <!-- 开关 -->
            <el-switch
              v-if="item.type === 'Switch'&&(!item.isHidden || item.isHidden(scope.row))"
              v-model="scope.row[item.prop]"
              :disabled="item.isDisabled && item.isDisabled(scope.row)"
              @change="item.change && item.change(scope.row)"
              active-color="#B5002A"
            ></el-switch>
            <el-tag v-if="item.type === 'Tag'" :type="item.setType&&item.setType(scope.row)">{{ scope.row[item.prop] }}</el-tag>
            <!-- 图像 -->
            <img
              v-if="item.type === 'Image'"
              :src="scope.row[item.prop]"
              @click="item.handle && item.handle(scope.row)"
            >
            <el-image
              v-if="item.type === 'elImage'&&scope.row[item.prop]"
              :src="scope.row[item.prop]"
              style="width:40px;height:40px;display: inherit;margin: auto;"
              @click="item.handle && item.handle(scope.row)"
              :preview-src-list="[scope.row[item.prop]]"/>
            <!-- 滑块 -->
            <el-slider
              v-if="item.type === 'Slider'"
              v-model="scope.row[item.prop]"
              :disabled="item.isDisabled && item.isDisabled(scope.row)"
              @change="item.change && item.change(scope.row)"
            ></el-slider>
            <!-- 状态  -->
            <template v-for="st in item.oneByone">
              <span
                v-if="item.type === 'Status' && st.key === scope.row[item.prop]"
                :key="st.key"
                class="Status"
                :class="st.classValue"
              ></span>
            </template>
            <span v-if="item.type === 'Status'">{{ item.formatter && item.formatter(scope.row[item.prop]) || scope.row[item.prop] }}</span>
            <!-- 默认 -->
            <span
              v-if="!item.type"
              :style="item.itemStyle && item.itemStyle(scope.row)"
              :class="item.itemClass && item.itemClass(scope.row)"
              @click="item.handleClick && item.handleClick(scope.row)"
            >
              {{
                (item.formatter && item.formatter(scope.row[item.prop])) ||
                  scope.row[item.prop]
              }}
            </span>
            <!-- 返回全部数据 -->
            <span
              v-if="item.type=='All'"
              :style="item.itemStyle && item.itemStyle(scope.row)"
              :class="item.itemClass && item.itemClass(scope.row)"
              @click="item.handleClick && item.handleClick(scope.row)"
            >
              {{
                (item.formatter && item.formatter(scope.row))
              }}
            </span>
            <el-link
              v-if="item.type === 'link'"
              type="primary"
              @click="item.handleClick && item.handleClick(scope.row)"
              :underline="false">
              <span>{{scope.row[item.prop]}}</span>
            </el-link>
          </template>
        </el-table-column>
      </el-table>
    </section>
    <!-- 分页 -->
    <section v-if="isPagination" class="override-default-pagination">
      <el-pagination
        class="paginationClass"
        v-if="pagination.total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        layout="total,sizes ,prev, pager, next, jumper"
        :page-sizes="paginationSizes"
        background
        :small='false'
        :page-size="pagination.pageSize"
        :current-page="pagination.pageNum"
        :total="pagination.total"
        v-show="!loading"
      ></el-pagination>
    </section>
  </section>
</template>

<script>
export default {
  name: 'selfTable',
  props: {
    // 表格型号：mini,medium,small
    size: { type: String, default: 'mini' },
    // 是否显示边框
    isBorder: { type: Boolean, default: false },
    // 是否显示加载状态
    loading: { type: Boolean, default: false },
    // 最大高度，超出时显示滚动条
    maxHeight: { type: [Number, String], default: null },
    // 固定高度
    height: { type: [Number, String], default: null },
    // 表格数据
    tableData: { type: Array, default: () => [] },
    // 表格列配置
    tableCols: { type: Array, default: () => [] },
    // 是否显示表格复选框
    isSelection: { type: Boolean, default: false },
    // 是否显示表头的全选框 true:显示 false:不显示
    isShowSelectAll: { type: Boolean, default: true },
    // Function的返回值决定某一行是否可以勾选 入参(row,index) true可以被勾选 false不可以被勾选
    handleSelectable: { type: Function, default: null },
    // 设置默认选中行
    defaultSelections: { type: [Array, Object], default: () => null },
    // 是否显示表格索引
    isIndex: { type: Boolean, default: false },
    // 自定义索引方法
    indexMethod: { type: Function, default: null },
    // index表头显示文字
    indexTitle: { type: String, default: '#' },
    // 是否显示分页
    isPagination: { type: Boolean, default: false },
    // 分页数据
    pagination: {
      type: Object,
      default: () => ({ pageSize: 10, pageNum: 1, total: 0 })
    },
    // 分页每页显示个数选择器的选项设置
    paginationSizes: { type: Array, default: () => [10, 20, 30, 50, 100] }
  },
  data () {
    return {}
  },
  computed: {
  },
  watch: {
    defaultSelections (val) {
      this.$nextTick(function () {
        this.$refs.spTableCom.clearSelection()
        if (Array.isArray(val)) {
          this.tableData.forEach(row => {
            val.forEach(sl => {
              if (this.$lodash.isEqual(row, sl)) {
                this.$refs.spTableCom.toggleRowSelection(row)
              }
            })
          })
        } else {
          this.tableData.forEach(row => {
            if (this.$lodash.isEqual(row, val)) {
              this.$refs.spTableCom.toggleRowSelection(row)
            }
          })
        }
      })
    },
    'pagination.total' (val) {
      if (val > 0 && val === (this.pagination.pageNum - 1) * this.pagination.pageSize) {
        this.pagination.pageNum -= 1
        this.$emit('refresh', this.pagination.pageNum, this.pagination.pageSize)
      }
    }
  },
  methods: {
    handleCommand (command, row) {
      this.$emit('showModel', command, row)
    },
    // 表格勾选
    select (rows, row) {
      this.$emit('select', rows, row)
    },
    // 全选
    selectAll (rows) {
      this.$emit('select', rows)
    },
    // 翻页
    handleCurrentChange (val) {
      this.pagination.pageNum = val
      this.$emit('refresh', val, this.pagination.pageSize)
    },
    // 清空选项
    handleResetSelect (val) {
      this.$refs.spTableCom.clearSelection()
    },
    // 改变大小时
    handleSizeChange (val) {
      this.pagination.pageNum = 1
      this.pagination.pageSize = val
      this.$emit('refresh', this.pagination.pageNum, val)
    },
    listenKeyDown (event) {
      if (event.keyCode === 13) {
        event.preventDefault()
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.sp-table {
  ::v-deep .el-table{
    font-size: 14px;
  }
  ::v-deep .el-table .cell{
    padding: 0px 5px;
    line-height: 48px;
  }
  ::v-deep .el-button{
    padding: 6px 5px;
    font-size: 14px;
  }
  ::v-deep .el-link{
    display: inline;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  ::v-deep .el-table--border th {
    background: #f9fcff;
    border-right: none;
  }
  ::v-deep .el-table__header th{
    background-color: #F4F4F4;
    color: rgba(0,0,0,0.85);
    height: 46px;
    .hiddenSelectAll{
      display: none;
    }
    &:nth-child(1){
      // padding-left: 30px;
    }
  }
  ::v-deep .el-table__row{
    td{
      &:nth-child(1){
        border-left: 1px solid #EBEEF5;
        // padding-left: 30px;
      }
      &:nth-last-child(1){
        border-right: 1px solid #EBEEF5;
      }
    }
  }

  ::v-deep .padding-col{
    padding-left: 30px;
    .cell{
      width: 100% !important;
    }
  }
  ::v-deep .el-table__fixed-right-patch{
    background: #F4F4F4;
  }
  ::v-deep .el-pagination{
    margin-top: 15px;
  }
  ::v-deep .el-radio{
    .el-radio__label{
      padding-left: 0px
    }
  }
  ::v-deep .errorBorder .el-input__inner{
    border: 1px solid red;
  }
  .el-dropdown {
    // @include color();
    margin-left: 10px;
  }
  ::v-deep .el-table__fixed-right {
    height: 100% !important;
  }
  .Status {
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    margin-right: 5px;
    position: relative;
    bottom: 2.5px;
  }
  .over {
    background: #79c95b;
  }
  .going {
    background: #09b0f7;
  }
  .editing {
    background: #ffb717;
  }
  .stop {
    background: #666666;
  }
  .fail {
    background: #FF3F3B;
  }
  // .override-default-pagination{
  //   display: flex;
  //   justify-content: flex-end;
  //   // .paginationClass{
  //   //   float: right;
  //   // }
  // }
  .override-default-pagination{
    // display: flex;
    // justify-content: flex-end;
    text-align: center;
    .paginationClass{
      display: inline-block;
      float: none;
    }
  }
}
.el-dropdown-link {
    cursor: pointer;
    color: #B5002A;
  }
</style>
<style scoped>
::v-deep
  .el-pagination.is-background .el-pager li:not(.disabled).active {
    background-color: #B5002A;
    color: #fff;
  }
</style>
