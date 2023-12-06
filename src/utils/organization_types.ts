const sheet = [{
    code: 'edu',
    name: '高等院校'
}, {
    code: 'gov',
    name: '政府机构'
}, {
    code: 'enterprise',
    name: '企业'
}, {
    code: 'ngo',
    name: '社团'
}, {
    code: 'entertainment',
    name: '娱乐'
}, {
    code: 'exhibition',
    name: '展会'
}, {
    code: 'restaurant',
    name: '餐饮'
}, {
    code: 'hotel',
    name: '住宿'
}, {
    code: 'media',
    name: '影视'
}, {
    code: 'other',
    name: '其他'
}]

export const typeName2Code = (name: string) => {
    const item = sheet.find((item) => item.name === name)
    if (item) {
        return item.code
    }
    return ''
}

export const typeCode2Name = (code: string) => {
    const item = sheet.find((item) => item.code === code)
    if (item) {
        return item.name
    }
    return ''
}

const deepCopy = <T>(obj: T): T => {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => deepCopy(item)) as unknown as T;
    }

    const newObj = {} as T;
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            newObj[key] = deepCopy(obj[key]);
        }
    }

    return newObj;
}

export const getOrganizationTypeSheet = () => {
    return deepCopy(sheet)
}