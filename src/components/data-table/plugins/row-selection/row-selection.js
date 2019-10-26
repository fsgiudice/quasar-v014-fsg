function getRowSelection (rows, selection, multiple) {
  if (!selection) {
    return []
  }
  return multiple ? rows.map(() => false) : [-1]
}

export default {
  data () {
    return {
      rowSelection: [],
      rowAllSelected: false
    }
  },
  created () {
    this.rowSelection = getRowSelection(this.rows, this.config.selection, this.multipleSelection)
  },
  watch: {
    'data' (value) {
      if (typeof value !== 'Array' || value.length === 0) {
        this.rowAllSelected = false
      }
    },
    'rowsSelected' (value) {
      if (value === 0) {
        this.rowAllSelected = false
      }
    },
    'config.selection' (value) {
      this.rowSelection = getRowSelection(this.rows, value, value === 'multiple')
    },
    rows (r) {
      this.rowSelection = getRowSelection(r, this.config.selection, this.multipleSelection)
    },
    rowSelection () {
      this.$nextTick(() => {
        this.$emit('selection', this.rowsSelected, this.selectedRows)

        if (this.rowsSelected) {
          this.toolbar = 'selection'
          return
        }
        if (this.toolbar === 'selection') {
          this.toolbar = ''
        }
      })
    }
  },
  computed: {
    multipleSelection () {
      return this.config.selection && this.config.selection === 'multiple'
    },
    rowsSelected () {
      if (this.multipleSelection) {
        return this.rowSelection.filter(r => r).length
      }
      return this.rowSelection.length && this.rowSelection[0] !== -1 ? 1 : 0
    },
    selectedRows () {
      if (this.multipleSelection) {
        return this.rowSelection
          .map((selected, index) => [selected, this.rows[index].__index])
          .filter(row => row[0])
          .map(row => {
            return { index: row[1], data: this.data[row[1]] }
          })
      }

      if (!this.rowSelection.length || this.rowSelection[0] === -1) {
        return []
      }
      const
        index = this.rows[this.rowSelection[0]].__index,
        row = this.data[index]

      return [{index, data: row}]
    }
  },
  methods: {
    selectAllRows (value) {
      // console.log('method selectAllRows:', value)
      if (!this.multipleSelection) {
        this.rowAllSelected = false
        return
      }
      this.rowAllSelected = value
      if (value) {
        this.rowsSelectAll()
      }
      else {
        this.rowsUnselectAll()
      }
    },
    rowsSelectAll () {
      // console.log('rowsSelectAll')
      this.rowSelection = this.rows.map((row) => (typeof this.config.selectable === 'function' ? this.config.selectable(row) : true))
    },
    rowsUnselectAll () {
      // console.log('rowsUnselectAll')
      this.rowSelection = this.rows.map(() => false)
    },
    clearSelection () {
      if (!this.multipleSelection) {
        this.rowSelection = [-1]
        return
      }
      this.rowSelection = this.rows.map(() => false)
      this.rowAllSelected = false
    },
    emitRowClick (row) {
      this.$emit('rowclick', row)
    }
  }
}
